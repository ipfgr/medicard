const wait = (ms) => setTimeout(() => {
}, ms)

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

const firebaseConfig = {
    apiKey: "AIzaSyCKGs3Hy8wmIT7M4OJ2SYWlwSVV2-d3TNg",
    authDomain: "medicard-db.firebaseapp.com",
    projectId: "medicard-db",
    storageBucket: "medicard-db.appspot.com",
    messagingSenderId: "872483625762",
    appId: "1:872483625762:web:060663b337fb53641fe37b",
    measurementId: "G-YQ7GVST827"
}

firebase.initializeApp(firebaseConfig);
const storageRef = firebase.storage().ref();


document.addEventListener('DOMContentLoaded', function () {
    let cardfilesresponse
    //Get current user ID from django template
    const currentUserMedId = JSON.parse(document.querySelector('#user-med-id').textContent)

    //Profile page section
    if (window.location.href.indexOf("portal/profile") > 1) {
        const userAllergenList = document.querySelector("#user-allergen-list")
        getUserAllergenHandler()

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
            "Other"
        ]
        const option = document.querySelector("#allergens")
        allergensArr.forEach(el => {
            option.insertAdjacentHTML("beforeend",
                `<option value=${el}>${el}</option>`
            )
        })
        const allergInput = document.querySelector(".custom-allergen")
        allergInput.style.display = "none"

        const optionSelect = document.querySelector("#allergens")
        const addAllergyButton = document.querySelector("#add-allergen")
        addAllergyButton.onclick = () => setUserAllergenHandler(optionSelect.value)

        if (document.querySelector("option").value == "Other") {
            allergInput.style.display = "block"

        }


    }


    //When you on cards page
    if (window.location.href.indexOf("portal/cards") > 1) {

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
        let compareDatabaseRecognizeInfo = (url, name) =>  {
            const recognized = document.querySelector(".recognized-images")
            fetch(`/portal/api/v1/cardfiles`)
                .then(response => response.json())
                .then(result => {
                    result.forEach(file => {
                        if (file.file_name == name){
                            if (file.rejected && !file.recognized){
                             recognized.insertAdjacentHTML("beforeend", `
                                            <div class="recognized-preview-container"> 
                                                <div class="rejected-recognized"></div>
                                                <h6>Rejected</h6>
                                                <img src="${url}" alt="document" width="auto" height="150px">
                                        </div>
                                        `)
                            console.log("Rejected")
                        }
                        else if (!file.rejected && file.recognized){
                            recognized.insertAdjacentHTML("beforeend", `
                                            <div class="recognized-preview-container"> 
                                                <div class="success-recognized"></div>
                                                <h6>Recognized</h6>
                                                <img src="${url}" alt="document" width="auto" height="150px">
                                        </div>
                                        `)
                            console.log("Recognized")
                        }
                        else {
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
        const openButton = document.createElement("button")
        const uploadButton = document.createElement("button")
        const preview = document.querySelector(".already-uploaded")
        const headerUpload = document.querySelector(".header-upload")
        if (options.multiply) {
            openInput.setAttribute("multiple", true)
        }
        if (options.accepttype && Array.isArray(options.accepttype)) {
            openInput.setAttribute("accept", options.accepttype.join(","))
        }
        //Create upload button
        uploadButton.classList.add("btn")
        uploadButton.classList.add("btn-outline-info")
        uploadButton.textContent = `Upload`
        //Create open files button
        openButton.classList.add("btn")
        openButton.classList.add("btn-outline-primary")
        openButton.textContent = `Open`

        headerUpload.insertAdjacentElement("beforeend", openButton)
        openButton.addEventListener("click", () => openInput.click())

        //When open pictures for upload you come her
        const changeHandler = (event) => {
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
            saveState(idArray)
        }

        //Fetch all picture names to save at DB
        function saveState(arr) {
            fetch(`/portal/api/v1/cardfiles`, {
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
        document.querySelector("#add-member-btn").style.visibility = "hidden"
        const searchMemberButton = document.getElementById("searach-member-btn")
        let idInput = document.getElementById("member-id")
        searchMemberButton.addEventListener('click', () => searchMember(idInput.value))

        const removeMemberButton = document.querySelectorAll(".remove-member")
        removeMemberButton.forEach(button => {
            const memberToRemoveId = button.value
            button.addEventListener("click", () => removeMember(memberToRemoveId))
        })
    }

    //when you on index portal page
    if (window.location.href.indexOf("portal") > 1) {
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

//get lis of user allergens and insert it to profile page
function getUserAllergenHandler() {
    console.log("Get Allergen list for user")
    const insertList = document.querySelector("#user-allergen-list")
    fetch(`/portal/api/v1/allergens`)
        .then(response => response.json())
        .then(result => {
            insertList.innerHTML = ""
            result.forEach(al => insertList.insertAdjacentHTML("beforeend", `
            <li><div class="allergen-name"><span>${al}</span><div class="remove-allergen" data-name="${al}">&times;</div></div></li>
            
            `))
        })
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
            .catch(err => console.log(err))
            .finally(() => {
                getUserAllergenHandler()
            })

    })
}

//Set (add) new alergens for user at profile page
function setUserAllergenHandler(allergen) {
    console.log("Send Post Request to Backend")
    const link = "allergens"
    if (allergen == "Select") {
        return
    }
    fetch(`/portal/api/v1/${link}`, {
        method: "POST",
        headers: {
            "X-CSRFTOKEN": getCookie("csrftoken")
        },
        body: JSON.stringify({
            allergen: allergen
        })

    })
        .then(response => response.json())
        .then(result => {
            console.log(result)

        })
        .catch(error => console.log(error))
        .finally(() => {
            getUserAllergenHandler()
        })
}

//remove family member at family page
function removeMember(id) {
    fetch('/portal/family/remove', {
        method: "POST",
        headers: {
            "X-CSRFToken": getCookie("csrftoken")
        },
        body: JSON.stringify({
            id: id
        })
    }).catch(error => console.log(error))
    location.reload()
}

//Search family member at family page
function searchMember(id) {
    const addMemberButton = document.querySelector("#add-member-btn")

    const resultDiv = document.getElementById("search-result")
    fetch(`/portal/search/${id}`)
        .then(response => response.json())
        .then(result => {
            if (result.message == "Not correct ID") {
                resultDiv.innerHTML = "Not Correct ID"
                addMemberButton.style.visibility = "hidden";

            } else {

                resultDiv.innerHTML = `Find user: ${JSON.stringify(result)} `
                addMemberButton.style.visibility = "visible";

            }

        }).catch(error => console.log(error))
        .finally(() => {

            document.querySelector("#add-member-btn").addEventListener("click", () => addMember(id))
        })
}

//Add family member at family page
function addMember(id) {
    console.log("Send Post Request to Backend")
    fetch(`/portal/family/add`, {
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
        .catch(error => console.log(error))

}


//Get CSRF token for send fetch to server securly
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

