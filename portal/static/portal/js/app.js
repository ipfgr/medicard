//init vue app
Vue.use(DatePicker.default);
    var vm = new Vue({
      el: '#app',
      components: { DatePicker },
      data: {
        startDate: '',
      },
      computed: {

      },
      mounted() {

      },
      methods: {

      }
    });


//Initialization Cloud FireStore and Firebase Datastore

const firebaseConfig = {
    apiKey: "AIzaSyCKGs3Hy8wmIT7M4OJ2SYWlwSVV2-d3TNg",
    authDomain: "medicard-db.firebaseapp.com",
    projectId: "medicard-db",
    storageBucket: "medicard-db.appspot.com",
    messagingSenderId: "872483625762",
    appId: "1:872483625762:web:060663b337fb53641fe37b",
    measurementId: "G-YQ7GVST827"
}
const app = firebase.initializeApp(firebaseConfig);
const storageRef = firebase.storage().ref();
const db = firebase.firestore(app);


function buttonMaker(tag, classlist, textcontent) {
    const button = document.createElement("tag")
    button.classList.add(...classlist)
    button.textContent = textcontent
    return button
}

document.addEventListener('DOMContentLoaded', function () {
    //Get current user ID from django template
    const currentUserMedId = JSON.parse(document.querySelector('#user-med-id').textContent)


    //Card section

    if (window.location.href.indexOf("portal/card") > 1){


    }

    //Profile page section
    if (window.location.href.indexOf("portal/profile") > 1) {
        const profileUserId = document.querySelector(".med_id")
        const changeAvatarInput = document.querySelector("#avatar-upload")
        const changeAvatarButton = document.querySelector("#avatar-upload-button")
        const buttonsDiv = document.querySelector("#buttons-save-edit")
        const searchInput = document.querySelector("#access-member-search")
        const selectAllergens = document.querySelector(".select-allergens")
        const searchAddButtons = document.querySelector(".search-access-btn")
        const accessBlock = document.querySelector(".access-list-div")
        const editProfileButton = buttonMaker("button", ["btn", "btn-outline-info"], "Edit Profile")
        const saveProfileButton = buttonMaker("button", ["btn", "btn-outline-info"], "Save Profile")
        const addAllergenButton = buttonMaker("button", ["btn", "btn-outline-info"], "Add Allergen")
        const searchMemberButton = buttonMaker("button", ["btn", "btn-outline-info"], "Search Member")
        const addMemberButton = buttonMaker("button", ["btn", "btn-outline-info", "add-member-btn"], "Add Member")
        const addAllergenButtonDiv = document.querySelector(".add-allergen-button")
        const inputs = document.querySelectorAll(".input-p")
        const optionSelected = document.querySelector("#allergens")
        const allergensArr = [
            "Gluten",
            "Crustaceans",
            "Eggs",
            "Fish",
            "Peanuts",
            "Soybeans",
            "Milk",
            "Nuts",
            "Celery",
            "Mustard",
            "Sesame",
            "Pulphites",
            "Lupin",
            "Molluscs",
        ]
        const medId = profileUserId.textContent

        accessBlock.style.display = "none"
        addMemberButton.style.visibility = "hidden"
        changeAvatarInput.style.display = "none"
        changeAvatarButton.style.display = "none"
        selectAllergens.style.display = "none"

        //If looking profile id and logged user id same
        if (currentUserMedId === medId) {
            buttonsDiv.insertAdjacentElement("beforeend", editProfileButton)
            addAllergenButtonDiv.insertAdjacentElement("beforeend", addAllergenButton)
            searchAddButtons.insertAdjacentElement("beforeend", searchMemberButton)
            searchAddButtons.insertAdjacentElement("beforeend", addMemberButton)

            changeAvatarButton.style.display = "block"
            accessBlock.style.display = "block"
            selectAllergens.style.display = "block"
            searchInput.style.display = "block"

            allergensArr.forEach(el => {
                optionSelected.insertAdjacentHTML("beforeend",
                    `<option value=${el}>${el}</option>`
                )
            })

            addAllergenButton.addEventListener("click", () => setUserAllergenHandler(optionSelected.value, medId))
            searchMemberButton.addEventListener("click", () => searchMember(searchInput.value, "access"))
            changeAvatarButton.addEventListener("click", () => changeAvatarInput.click())

            getAccessList()
        }
        //Set to Disable all input fields
        inputs.forEach(input => {
            input.disabled = true
        })


        //handler for upload avatar to DB and write new link to db user profile
        const changeAvatarHandler = (event) => {
            const avatar = event.target.files[0]
            const validator = validateSize(avatar, 2)
            if (validator) {
                let extension = ""
                let uniqueId = Math.random().toString(36).substring(2);
                switch (avatar.type) {
                    case "image/jpeg":
                        extension = ".jpg"
                        break
                    case "image/gif":
                        extension = ".gif"
                        break
                    case "image/png":
                        extension = ".png"
                        break
                }
                let uploadTask = storageRef.child(`portal/img/uploaded/${currentUserMedId}/avatar/${uniqueId}${extension}`).put(avatar)
                uploadTask.on('state_changed',
                    (snapshot) => {
                        // Observe state change events such as progress, pause, and resume
                        // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
                        var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                        console.log('Upload is ' + progress + '% done');
                        switch (snapshot.state) {
                            case firebase.storage.TaskState.PAUSED: // or 'paused'
                                console.log('Upload is paused');
                                break;
                            case firebase.storage.TaskState.RUNNING: // or 'running'
                                console.log('Upload is running');
                                break;
                        }
                    },
                    (error) => {
                        console.error(error)
                    },
                    () => {
                        // Handle successful uploads on complete
                        // For instance, get the download URL: https://firebasestorage.googleapis.com/...
                        uploadTask.snapshot.ref.getDownloadURL().then((downloadURL) => {
                            console.log(downloadURL)
                            fetch(`/portal/api/v1/avatar_upload`, {
                                method: "PUT",
                                headers: {
                                    "X-CSRFToken": getCookie("csrftoken")
                                },
                                body: JSON.stringify({
                                    url: downloadURL
                                })
                            }).then(response => response.json)

                                .catch(error => console.error(error))
                        });
                    })
            } else {

            }

        }

        //Handler to update profile information at DB
        const updateProfileHandler = (profileBody) => {
            fetch(`/portal/api/v1/profile`, {
                method: "POST",
                headers: {
                    "X-CSRFToken": getCookie("csrftoken")
                },
                body: JSON.stringify(profileBody)
            })
                .then(response => response.json())
                .then(result => console.log(result))
                .catch(error => console.error(error))
                .finally(() => location.reload())
        }
        getUserAllergenHandler(currentUserMedId, medId)

        //array of allergens for choose at profile page

        const allergInput = document.querySelector(".custom-allergen")
        allergInput.style.display = "none"


        changeAvatarInput.addEventListener("change", changeAvatarHandler)

        editProfileButton.addEventListener("click", () => {
            editProfileButton.style.display = "none"
            inputs.forEach(input => {
                input.disabled = false
            })
            buttonsDiv.insertAdjacentElement("beforeend", saveProfileButton)

        })
        saveProfileButton.addEventListener("click", () => {
            let profileBody = {}
            const valid = validationForm(inputs)
            if (valid) {
                inputs.forEach(input => {
                    profileBody[input.id] = input.value
                })
                console.log(profileBody)
                updateProfileHandler(profileBody)
            }

        })
    }

    //When you on recognizer page
    if (window.location.href.indexOf("portal/recognizer") > 1) {

        //Get list of all medical reports in user upload storage for output
        const getUploadedImages = () => {
            const storageList = firebase.storage().ref(`documents/uploaded/${currentUserMedId}/`)
            storageList.listAll()
                .then(result => {
                    result.items.forEach(imageRef => {
                        imageRef.getDownloadURL()
                            .then(url => {
                                compareDatabaseRecognizeInfo(url, imageRef.name)
                            })
                    })
                }).catch(error => console.error("Error:", error))
        }

        //Check in our database with documents  reconized / uploaded or rejected
        let compareDatabaseRecognizeInfo = (url, name) => {
            const recognized = document.querySelector(".recognized-images")
            fetch(`/portal/api/v1/recognizer`)
                .then(response => response.json())
                .then(result => {
                    result.forEach(file => {
                        if (file.file_name == name) {
                            if (file.rejected && !file.recognized) {
                                recognized.insertAdjacentHTML("beforeend", `
                                            <div class="recognized-preview-container"> 
                                                <div class="rejected-recognized"></div>
                                                <h6>Rejected</h6>
                                                <img src="${url}" alt="document" width="auto" height="150px">
                                        </div>
                                        `)
                                console.log("Rejected")
                            } else if (!file.rejected && file.recognized) {
                                recognized.insertAdjacentHTML("beforeend", `
                                            <div class="recognized-preview-container"> 
                                                <div class="success-recognized"></div>
                                                <h6>Recognized</h6>
                                                <img src="${url}" alt="document" width="auto" height="150px">
                                        </div>
                                        `)
                                console.log("Recognized")
                            } else {
                                recognized.insertAdjacentHTML("beforeend", `
                                            <div class="recognized-preview-container"> 
                                                <img src="${url}" alt="document" width="auto" height="150px">
                                            </div>`)
                                console.log("Uploaded")
                            }
                        }
                    })
                })
        }

        //Get urls
        getUploadedImages()

        //Make all files global see
        let files = []
        //Upload pictures options
        const options = {
            multiply: true,
            accepttype: [".jpg", ".png", ".jpeg", ".gif"]
        }

        const openInput = document.querySelector("#file-input")
        const preview = document.querySelector(".already-uploaded")
        const headerUpload = document.querySelector(".header-upload")
        const openButton = buttonMaker("button", ["btn", "btn-outline-primary"], "Open")
        const uploadButton = buttonMaker("button", ["btn", "btn-outline-info"], "Upload")

        if (options.multiply) {
            openInput.setAttribute("multiple", true)
        }
        if (options.accepttype && Array.isArray(options.accepttype)) {
            openInput.setAttribute("accept", options.accepttype.join(","))
        }

        headerUpload.insertAdjacentElement("beforeend", openButton)
        openButton.addEventListener("click", () => openInput.click())

        //When open pictures for upload you come her
        const changeHandler = (event) => {
            console.log(event)
            preview.innerHTML = ""
            files = Array.from(event.target.files)
            uploadButton.addEventListener("click", () => uploadHandler(files))
            files.forEach(file => {
                if (!file.type.match("image")) {
                    return
                }
                //insert upload button when have files to upload
                headerUpload.insertAdjacentElement("beforeend", uploadButton)
                uploadButton.style.display = "block"


                //Add previews of opened pictures
                const reader = new FileReader
                reader.onload = ev => {
                    preview.insertAdjacentHTML("beforeend",
                        `<div class="img-preview-container">
                               <div class="remove-img" data-name="${file.name}">
                                &times;
                              </div>
                              <div class="img-info">${file.name} , ${formatBytes(file.size)}</div>
                              <img src="${ev.target.result}" alt="${file.name}">
                              </div>
                              `
                    )
                }
                reader.readAsDataURL(file)

            })
        }
        //Remove pictures before upload
        const removeHandler = event => {
            if (!event.target.dataset.name) {
                return
            }
            const {name} = event.target.dataset
            files = files.filter(file => file.name != name)
            if (!files.length) {
                uploadButton.style.display = "none"
            }
            const remove = document.querySelector(`[data-name="${name}"`).closest(".img-preview-container")
            remove.remove()


        }
        //Upload pictures to Firebase Storage
        const uploadHandler = (files) => {
            const progressBar = document.querySelector(".progress-bar")
            preview.querySelectorAll(".remove-img").forEach(e => e.remove())
            let idArray = []
            files.forEach(file => {
                //make unique id for each new picture
                let uniqueId = Date.now() + Math.random().toString(36).substring(2);

                let extension = ""
                switch (file.type) {
                    case "image/jpeg":
                        extension = ".jpg"
                        break
                    case "image/gif":
                        extension = ".gif"
                        break
                    case "image/png":
                        extension = ".png"
                        break
                }
                //Add all uploaded picture names to array
                idArray.push(uniqueId + extension)
                let uploadTask = storageRef.child(`documents/uploaded/${currentUserMedId}/${uniqueId}${extension}`).put(file)
                uploadTask.on('state_changed',
                    (snapshot) => {
                        // Observe state change events such as progress, pause, and resume
                        // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
                        let progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100

                        console.log('Upload is ' + progress.toFixed(0) + '% done');

                        switch (snapshot.state) {
                            case firebase.storage.TaskState.PAUSED: // or 'paused'
                                console.log('Upload is paused')
                                break
                            case firebase.storage.TaskState.RUNNING: // or 'running'
                                console.log('Upload is running')
                                break
                        }
                    },
                    (error) => {
                        console.log(error)
                    },
                    () => {
                        // Handle successful uploads on complete
                        // For instance, get the download URL: https://firebasestorage.googleapis.com/...
                        preview.innerHTML = ""
                        uploadTask.snapshot.ref.getDownloadURL().then((downloadURL) => {
                            console.log('File available at', downloadURL)
                            progressBar.innerHTML = ""
                            uploadButton.style.display = "none"
                        })
                    }
                )
            })
            //save picture names array to DB
            saveNames(idArray)
        }

        //Fetch all picture names to save at DB
        function saveNames(arr) {
            fetch(`/portal/api/v1/recognizer`, {
                method: "POST",
                headers: {
                    "X-CSRFToken": getCookie("csrftoken")
                },
                body: JSON.stringify({
                    filenames: arr
                })
            })
        }

        openInput.addEventListener("change", changeHandler)
        preview.addEventListener("click", removeHandler)


    }

    // When you on family page
    if (window.location.href.indexOf("portal/family") > 1) {
        document.querySelector(".add-member-btn").style.visibility = "hidden"
        const searchMemberButton = document.querySelector(".search-member-btn")
        let idInput = document.getElementById("member-id")
        searchMemberButton.addEventListener('click', () => searchMember(idInput.value, "member"))

        const removeMemberButton = document.querySelectorAll(".remove-member")
        removeMemberButton.forEach(button => {
            const memberToRemoveId = button.value
            button.addEventListener("click", () => removeMember(memberToRemoveId))
        })
    }

    //When you on index portal page
    if (window.location.href.indexOf("portal/dashboard") > 1) {
        let dateArr = ["10:11:20", "10.12.20"]
        let dataArr = [88, 90]
        const ctx = document.getElementById('weight-chart1').getContext('2d');
        const ctx2 = document.getElementById('weight-chart2').getContext('2d');
        const chart = new Chart(ctx, {
            // The type of chart we want to create
            type: 'line',

            // The data for our dataset
            data: {
                labels: dateArr,
                datasets: [{
                    label: 'Your Weight ',
                    borderColor: '#fb6f0cd1',
                    data: dataArr
                }]
            },

            // Configuration options go here
            options: {}
        });
        const chart2 = new Chart(ctx2, {
            // The type of chart we want to create
            type: 'line',

            // The data for our dataset
            data: {
                labels: dateArr,
                datasets: [{
                    label: 'Your Weight ',
                    borderColor: '#fb6f0cd1',
                    data: dataArr
                }]
            },

            // Configuration options go here
            options: {}
        });

    }
})


function getAccessList() {
    const accessList = document.querySelector(".access-list")
    accessList.innerHTML = ""
    fetch(`/portal/api/v1/access`)
        .then(response => response.json())
        .then(result => {
            console.log(result)
            result.forEach(el => {
                accessList.insertAdjacentHTML("beforeend", `<li><div class="item-name"><span>${el.give_access}</span><div class="remove" data-name="${el.give_access}">&times;</div></div></li>`)
            })
        })
    accessList.addEventListener("click", event => {
        if (!event.target.dataset.name) {
            return
        }
        const name = event.target.dataset.name
        fetch(`/portal/api/v1/access`, {
            method: "DELETE",
            headers: {
                "X-CSRFToken": getCookie("csrftoken")
            },
            body: JSON.stringify({
                delete: name
            })
        }).then(response => response.json())
            .then(result => console.log(result))
            .catch(err => console.error(err))
            .finally(() => {
                getAccessList()
            })

    })
}

//Get lis of user allergens and insert it to profile page
function getUserAllergenHandler(user, med_id) {
    console.log("Get Allergen list for user")
    const insertList = document.querySelector("#user-allergen-list")
    fetch(`/portal/api/v1/allergens/${med_id}`)
        .then(response => response.json())
        .then(result => {
            insertList.innerHTML = ""
            result.forEach(al => {
                if (user === med_id) {
                    insertList.insertAdjacentHTML("beforeend", `
            <li><div class="item-name"><span>${al}</span><div class="remove" data-name="${al}">&times;</div></div></li>
            `)
                } else {
                    insertList.insertAdjacentHTML("beforeend", `
            <li><div class="item-name"><span>${al}</span></div></li>
            `)
                }
            })
        })

    //if click on delete send fetch to delete allergen from DB and reload allergen list
    insertList.addEventListener("click", event => {
        if (!event.target.dataset.name) {
            return
        }
        const name = event.target.dataset.name
        fetch(`/portal/api/v1/allergens`, {
            method: "DELETE",
            headers: {
                "X-CSRFToken": getCookie("csrftoken")
            },
            body: JSON.stringify({
                delete: name
            })

        })
            .then(response => response.json())
            .then(result => console.log(result))
            .catch(err => console.error(err))
            .finally(() => {
                getUserAllergenHandler(med_id)
            })

    })
}

//Set (add) new allergens for user at profile page
function setUserAllergenHandler(allergen, med_id) {
    console.log("Send Post Request to Backend")
    const link = "allergens"
    if (allergen == "Select") {
        return
    }
    fetch(`/portal/api/v1/${link}`, {
        method: "POST",
        headers: {
            "X-CSRFToken": getCookie("csrftoken")
        },
        body: JSON.stringify({
            allergen: allergen
        })

    })
        .then(response => response.json())
        .then(result => {
            console.log(result)
        })
        .catch(error => console.error(error))
        .finally(() => {
            getUserAllergenHandler(med_id)
        })
}

//remove family member at family page
function removeMember(id) {
    fetch('/portal/api/v1/family/remove', {
        method: "DELETE",
        headers: {
            "X-CSRFToken": getCookie("csrftoken")
        },
        body: JSON.stringify({
            id: id
        })
    }).catch(error => console.error(error))
    location.reload()
}

//Search family member at family page
function searchMember(id, options) {
    const addMemberButton = document.querySelector(".add-member-btn")
    const resultDiv = document.querySelector(".search-result")
    fetch(`/portal/api/v1/search/${id}`)
        .then(response => response.json())
        .then(result => {
            if (result.message == "Not correct ID") {
                resultDiv.innerHTML = "Not Correct ID"
                addMemberButton.style.visibility = "hidden";
            } else {
                resultDiv.innerHTML = `Find user: ${JSON.stringify(result)} `
                addMemberButton.style.visibility = "visible";
            }
        }).catch(error => console.error(error))
        .finally(() => {
            if (options == "member") {
                addMemberButton.addEventListener("click", () => addMember(id))
            }
            if (options == "access")
                addMemberButton.addEventListener("click", () => addAccess(id))
        })
}

//Add family member at family page
function addMember(id) {
    console.log("Send Post Request to Backend")
    fetch(`/portal/api/v1/family`, {
        method: "POST",
        headers: {
            "X-CSRFToken": getCookie("csrftoken")
        },
        body: JSON.stringify({
            medid: id
        })
    })
        .then(response => response.json())
        .then(result => console.log(result))
        .finally(() => location.reload())
        .catch(error => console.error(error))

}

//Add family member at family page
function addAccess(id) {
    console.log("Send Post Request to Backend")
    fetch(`/portal/api/v1/access`, {
        method: "POST",
        headers: {
            "X-CSRFToken": getCookie("csrftoken")
        },
        body: JSON.stringify({
            access: id
        })
    })
        .then(response => response.json())
        .then(result => console.log(result))
        .finally(() => location.reload())
        .catch(error => console.error(error))

}

//Get CSRF token for send fetch to server securely
function getCookie(name) {
    var cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
            var cookie = jQuery.trim(cookies[i]);
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

//Bites to normal size converter function
function formatBytes(bytes, decimals) {
    if (bytes == 0) {
        return "0 Byte"
    }
    const k = 1024; //Or 1 kilo = 1000
    const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + " " + sizes[i]
}


