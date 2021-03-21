//Firebase Config
const firebaseConfig = {
    apiKey: "AIzaSyCKGs3Hy8wmIT7M4OJ2SYWlwSVV2-d3TNg",
    authDomain: "medicard-db.firebaseapp.com",
    projectId: "medicard-db",
    storageBucket: "medicard-db.appspot.com",
    messagingSenderId: "872483625762",
    appId: "1:872483625762:web:060663b337fb53641fe37b",
    measurementId: "G-YQ7GVST827"
}

//Initialization Cloud FireStore and Firebase Datastore
const app = firebase.initializeApp(firebaseConfig);
const storageRef = firebase.storage().ref();
const db = firebase.firestore(app);

//Register ServiceWorker
// window.addEventListener("load" , async () => {
//     //Register service workers
//         if (navigator.serviceWorker){
//             try{
//                const reg = await navigator.serviceWorker.register(`http://127.0.0.1:8000/sw.js`)
//             }
//             catch (e) {
//                 console.error(e)
//             }
//         }
// })

//Options that's can selected in input unit field
const selectOptions = [
    "<option value='10^9L'>10^9L</option>",
    "<option value='10^12L'>10^12L</option>",
    "<option value='%'>%</option>",
    "<option value='g/dL'>g/dL</option>",
    "<option value='fL'>fL</option>",
    "<option value='pg'>pg</option>",
    "<option value='fl'>fl</option>",
    "<option value='mg/L'>mg/L</option>",
    "<option value='g/L'>g/L</option>",
    "<option value='mmol/L'>mmol/L</option>",
    "<option value='umol/L'>umol/L</option>",
    "<option value='Ery/uL'>Ery/uL</option>",
    "<option value='none'>none</option>",
]

 //Generate document uniqueid number
const documentIdGenerator = () => "MD-" + Math.random().toString(36).substring(2)

document.addEventListener('DOMContentLoaded', function () {
            //Get current user ID from django template
        const currentUserMedId = JSON.parse(document.querySelector('#user-med-id').textContent)


        // When you on card page
        if (window.location.href.indexOf("portal/card") > 1) {
            //Create buttons
            const addLineButton = buttonMaker("button", ["btn", "btn-warning"], "+Add Line")
            const addImageButton = buttonMaker("button", ["btn", "btn-success"], "+ Add image")
            const saveResultButton = buttonMaker("button", ["btn", "btn-info"], "Save")
            const searchResultButton = buttonMaker("button", ["btn", "btn-info"], "Search")
            const hideModalButton = buttonMaker("button", ["btn", "btn-info"], "Hide")
            const showModalButton = buttonMaker("button", ["btn", "btn-info"], "Add new results")

            const modalContainer = document.querySelector(".modal-container")
            const inputFile = document.querySelector("#image-add-record")
            const inputDivPlace = document.querySelector("#input0")
            const buttonsDivPlace = document.querySelector('.modal-control-buttons')
            const linesInfo = document.querySelector(".lines-info")
            const documentId = document.querySelector('#generated-doc-id')
            const datePicker = document.querySelector(".date-picker")
            const modalTriggerDiv = document.querySelector(".open-modal")
            const searchRecordContainer = document.querySelector(".search-record-container")
            const lookingId = document.querySelector(".id-number").innerHTML.trim()
            const reportContainer = document.querySelector(".report-container")
            const previewContainerRecord = document.querySelector("#preview-container-record")
            const modalButtonsContainer = document.querySelector(".modal-buttons-container")


            //Global files array for add images
            let recordFiles = []

            //Limit maximum fields to add in form
            let counter = 20

            datePicker.insertAdjacentElement("afterend", searchResultButton)
            modalButtonsContainer.insertAdjacentElement("beforeend", addLineButton)
            modalButtonsContainer.insertAdjacentElement("beforeend", addImageButton)
            buttonsDivPlace.insertAdjacentElement("beforeend", saveResultButton)
            modalTriggerDiv.insertAdjacentElement("beforeend", hideModalButton)
            modalTriggerDiv.insertAdjacentElement("beforeend", showModalButton)

            // Insert new generated document ID
            documentId.innerHTML = documentIdGenerator()
            modalContainer.style.display = "none"
            hideModalButton.style.display = "none"
            reportContainer.style.display = "none"
            inputFile.style.display = "none"

            //When press hide Modal button
            hideModalButton.addEventListener("click", () => {
                modalContainer.classList.add("hide-modal")
                showModalButton.style.display = "block"
                hideModalButton.style.display = "none"
            })

                //When press Add new report button
            showModalButton.addEventListener("click", () => {
                modalContainer.classList.remove("hide-modal")
                reportContainer.innerHTML = ""
                reportContainer.style.display = "none"
                modalContainer.style.display = "block"
                showModalButton.style.display = "none"
                hideModalButton.style.display = "block"
            })

            //When we press search button
            searchResultButton.addEventListener("click", () => {
                const dateFromSearch = document.querySelector("#date-from").value
                const dateToSearch = document.querySelector("#date-to").value
                if (dateFromSearch && dateToSearch) {
                    getFromFireStore(lookingId, dateFromSearch, dateToSearch)
                    console.log("Search from", dateFromSearch, "to", dateToSearch)
                }
            })


            //Add line to report modal
            addLineButton.addEventListener("click", () => {
                linesInfo.innerHTML = `* Can add more ${counter} fields`
                //set limit of add input fields
                if (counter > 0) {
                    inputDivPlace.insertAdjacentHTML("beforeend", `
                <div class="input-container" >
                    <input type="text" name="parameter" class="custom-input body-input" placeholder="Parametr">
                    <input type="text" name="result" class="custom-input body-input" placeholder="Result">
                    <select name="select" class="custom-input body-input">
                        ${selectOptions}
                    </select>
                    <input type="text" name="range" class="custom-input body-input" placeholder="Normal Range">
                    <div class="remove-line" data-name="${counter}">&times;</div>
                </div>
                    `)
                    counter--
                }
            })

            //Add image to report modal
            addImageButton.addEventListener('click', () => inputFile.click())

            //Show images preview at modal container
            inputFile.addEventListener("change", (event) => {
                //clean from old files
                recordFiles = []
                previewContainerRecord.innerHTML = ""

                recordFiles = Array.from(event.target.files)
                //Validate upload files size
                recordFiles.forEach(file => {
                    if (validateSize(file, 2)) {
                        const fReader = new FileReader()
                        fReader.onload = ev => {
                            previewContainerRecord.insertAdjacentHTML("beforeend",
                                `<div class="img-preview-container">
                                   <div class="remove-img" data-name="${file.name}">
                                    &times;
                                  </div>
                                  <div class="img-info">${file.name} , ${formatBytes(file.size)}</div>
                                  <img src="${ev.target.result}" alt="${file.name}">
                                  </div>
                                  `)
                        }
                        fReader.readAsDataURL(file)
                    }
                })
            })

            //Remove IMG preview handler
            previewContainerRecord.addEventListener("click", event => {
                //Check for empty input
                if (!event.target.dataset.name) {
                    return
                }
                const {name} = event.target.dataset
                recordFiles = recordFiles.filter(file => file.name != name)
                const remove = document.querySelector(`[data-name="${name}"`).closest(".img-preview-container")
                remove.remove()
            })

            //Listener for remove fields in form
            inputDivPlace.addEventListener("click", (event) => {
                if (!event.target.dataset.name) return
                const remove = document.querySelector(`[data-name="${event.target.dataset.name}"`).closest(".input-container")
                remove.remove()
                counter++
            })

            //When click on search result load this result to main page
            searchRecordContainer.addEventListener("click", event => {
                const ident = event.target.dataset.id
                if (!ident) {
                    return
                }

                //Clean active all classes
                removeActiveClass("result-item")
                //Add active class to clicked result (JQuery Required)
                $(event.target).addClass('active')

                //remove visability for modal container
                reportContainer.style.display = "block"
                reportContainer.innerHTML = ""
                modalContainer.style.display = "none"

                hideModalButton.click()
                console.log("Get info from document:", ident)
                //Get document from Firebase and draw document page
                db.collection(`users/${lookingId}/reports/`)
                    .doc(ident)
                    .get()
                    .then((doc) => {
                        const report = doc.data()
                        reportContainer.insertAdjacentHTML("beforeend", `
                <!--            Start report output template               -->
                            <div class="report-add">
                            <div class="report-header"><h4>Result</h4></div>
                                <div class="row-main">
                                <div class="column-quater">
                                    <p><span>User ID: </span><span >${report.med_id}</span></p >
                                    <p><span>Document ID: </span><span>${report.document_id}</span></p>
                                    <button class="btn btn-warning" onclick="window.print()">Print</button>
                                </div>
                                    <div class="column-quater">
                                        <input class="custom-input" value="${report.report_name}" type="text" disabled>
                                        <input class="custom-input" value="${report.hospital_name}" type="text" disabled>
                                        <input class="custom-input" value="${report.date}" type="date" disabled>
                                        <input class="custom-input" value="${report.address}" type="text" disabled>
                                    </div>
                                </div>
                            <div class="report-add-body">
                                <div class="report-add-header"><h4>Results</h4></div>
                            <div class="output0"></div>
                            <div class="recognized-images"></div>
                            <div class="summary-info">
                                <div class="form-group">
                                    <textarea class="form-control"
                                              maxlength="500"
                                              placeholder="Summary information"
                                              rows="5" disabled>${report.summary}
                                    </textarea>
                                </div>
                            </div>
                            </div>
                        </div>
                <!--                End report output template                 -->
                `)
                        //Add results information if existing in report
                        const output = document.querySelector(".output0")
                        const recordImages = document.querySelector(".recognized-images")
                        output.insertAdjacentHTML("afterbegin", `
                                <div class="input-container" >
                                <input type="text" value="Parameter" class="custom-input label" disabled>
                                <input type="text" value="Result" class="custom-input label" disabled>
                                <input type="text" value="Units" class="custom-input label" disabled>
                                <input type="text" value="Normal Range" class="custom-input label" disabled>
                                </div>
                                `)
                        for (let i = 1; i < 21; i++) {
                            if (report.hasOwnProperty("input" + i)) {
                                output.insertAdjacentHTML("beforeend", `
                            <div class="input-container" >
                                <input type="text" value="${report["input" + i][0]}" class="custom-input" disabled>
                                <input type="text" value="${report["input" + i][1]}" class="custom-input" disabled>
                                <input type="text" value="${report["input" + i][2]}" class="custom-input" disabled>
                                <input type="text" value="${report["input" + i][3]}" class="custom-input" disabled>
                            </div>
                            `)
                            }
                        }
                        //Add images preview's if have links at report
                        if (report.files.length) {
                            recordImages.insertAdjacentHTML("beforebegin", `<h6> Uploaded images </h6>`)
                            report.files.forEach(file => {
                                recordImages.insertAdjacentHTML("beforeend", `
                                    <div class="recognized-preview-container">
                                    <img class="" src=${file} alt="Image in record" height="150px">
                                    </div>
                                    `)
                            })
                            //Start worker for add Event Listeners for modal preview images works
                            previewWorker()
                        }
                    })
            })
            //Handler for save input results when press save button
            saveResultButton.addEventListener("click", () => {
                const topInputs = document.querySelectorAll(".top-input")
                const summary = document.querySelector(".summary")
                //array for images links
                const fileLinksArr = []

                //Check if important data [ Name, date, hospital and address inputed ]
                if (validateResult(topInputs)) {
                    // Upload images to storage and get links to array
                    const uploadImageFirst = new Promise(function (resolve, reject) {
                        if (recordFiles.length) {
                            //If have images before start upload we remove "delete image" button
                            const remover = document.querySelectorAll(".remove-img")
                            remover.forEach(el => {
                                el.remove()
                            })
                            // write each file to firebase storage and get files links
                            recordFiles.forEach(file => {
                                const uploadTask = storageRef.child(`documents/${currentUserMedId}/added/${file.name}`).put(file)
                                uploadTask.on('state_changed',
                                    (snapshot) => {
                                        // Observe state change events such as progress, pause, and resume
                                        // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
                                        var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                                        console.log('Upload is ' + progress + '% done');
                                        switch (snapshot.state) {
                                            case firebase.storage.TaskState.RUNNING: // or 'running'
                                                console.log('Upload is running');
                                                break;
                                        }
                                    },
                                    (error) => {
                                        console.error(error)
                                    },
                                    () => {
                                        //Write file links to array
                                        uploadTask.snapshot.ref.getDownloadURL().then((downloadURL) => {
                                            fileLinksArr.push(downloadURL)
                                            if (fileLinksArr.length == recordFiles.length) {
                                                console.log(fileLinksArr, recordFiles)
                                                alert("Success uploaded")
                                                resolve()
                                            }
                                        });
                                    }
                                );
                            })
                        } else resolve()
                    })

                    // After we make array with image links, upload data to FireStore
                    uploadImageFirst.then(() => {
                        //Make object with data to upload to firestore
                        const contextData = () => {
                            let context = Array
                                .from(document.querySelectorAll('.input-container'))
                                .reduce((acc, el, i) => (
                                        acc[`input${i + 1}`] = [
                                            'parameter',
                                            'result',
                                            'select',
                                            'range',
                                        ].map(name => el.querySelector(`[name="${name}"]`).value),
                                            acc
                                    ), {
                                        med_id: currentUserMedId,
                                        document_id: documentId.innerHTML,
                                        summary: summary.value,
                                        files: fileLinksArr
                                    }
                                );
                            topInputs.forEach(input => {
                                context[input.name] = input.value
                            })
                            return context
                        }
                        //Write to fireStore
                        writeDocToFireStore(currentUserMedId, contextData)
                    })
                } else console.log("not valid")
            })
        }

        // When you on profile page
        if (window.location.href.indexOf("portal/profile") > 1) {
            const profileUserId = document.querySelector(".med_id")
            const changeAvatarInput = document.querySelector("#avatar-upload")
            const changeAvatarButton = document.querySelector("#avatar-upload-button")
            const buttonsDiv = document.querySelector("#buttons-save-edit")
            const searchInput = document.querySelector("#access-member-search")
            const selectAllergens = document.querySelector(".select-allergens")
            const searchAddButtons = document.querySelector(".search-access-btn")
            const accessBlock = document.querySelector(".access-list-div")
            const editProfileButton = buttonMaker("button", ["btn", "btn-info"], "Edit Profile")
            const saveProfileButton = buttonMaker("button", ["btn", "btn-info"], "Save Profile")
            const addAllergenButton = buttonMaker("button", ["btn", "btn-info"], "Add Allergen")
            const searchMemberButton = buttonMaker("button", ["btn", "btn-info"], "Search Member")
            const addMemberButton = buttonMaker("button", ["btn", "btn-info", "add-member-btn"], "Add Member")
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
            const requested_med_id = profileUserId.textContent

            accessBlock.style.display = "none"
            addMemberButton.style.visibility = "hidden"
            changeAvatarInput.style.display = "none"
            changeAvatarButton.style.display = "none"
            selectAllergens.style.display = "none"

            //If looking profile id and logged user id same
            if (currentUserMedId === requested_med_id) {
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

                addAllergenButton.addEventListener("click", () => setUserAllergenHandler(optionSelected.value, requested_med_id))
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
                    //Check inputed filetypes
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
                    let uploadTask = storageRef.child(`portal/img/${currentUserMedId}/uploaded/avatar/${uniqueId}${extension}`).put(avatar)
                    uploadTask.on('state_changed',
                        (snapshot) => {
                            // Observe state change events such as progress, pause, and resume
                            // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
                            let progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
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
                                })
                                    .then(response => response.json)
                                    .then(result => console.log(result))

                                    .catch(error => console.error(error))
                            });
                            saveUserLog(currentUserMedId,"Upload new Avatar")
                        })
                } else {

                }
            }


            getUserAllergenHandler(currentUserMedId, requested_med_id)

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
                    updateProfileHandler(profileBody, currentUserMedId)
                }

            })
        }

        //When you on recognizer page
        if (window.location.href.indexOf("portal/recognizer") > 1) {
            //Make buttons
            const openButton = buttonMaker("button", ["btn", "btn-primary"], "Open")
            const uploadButton = buttonMaker("button", ["btn", "btn-info"], "Upload")

            const recognized = document.querySelector(".recognized-images")
            const openInput = document.querySelector("#file-input")
            const preview = document.querySelector(".already-uploaded")
            const headerUpload = document.querySelector(".header-upload")

            //Get urls
            getUploadedImages()

            //Start worker for add event listeners for Modal preview images work
            previewWorker()

            //Make all files global see
            let files = []
            //Upload pictures options
            const options = { multiple: true,  accept: [".jpg", ".png", ".jpeg", ".gif"] }

            //Options for upload images (Accept multiple files input and files formats to accept
            if (options.multiple) { openInput.setAttribute("multiple", "true") }
            if (options.accept && Array.isArray(options.accept)) { openInput.setAttribute("accept", options.accept.join(",")) }

            headerUpload.insertAdjacentElement("beforeend", openButton)
            openButton.addEventListener("click", () => openInput.click())

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

             //Check in our database with documents  reconized / uploaded or rejected
            function compareDatabaseRecognizeInfo (url){
                //Get info from database
                fetch(`/portal/api/v1/recognizer`)
                    .then(response => response.json())
                    .then(result => {
                        result.forEach(file => {
                            if (file.full_file_url == url) {
                                console.log("yes")
                                //If in database have flag Rejecter, cover by div
                                if (file.rejected && !file.recognized) {
                                    recognized.insertAdjacentHTML("beforeend", `
                                            <div class="recognized-preview-container"> 
                                                <div class="rejected-recognized"></div>
                                                <h6>Rejected</h6>
                                                <img src="${file.full_file_url}" alt="document" >
                                        </div>
                                        `)
                                }
                                 //If in database have flag Recognized, cover by div
                                else if (!file.rejected && file.recognized) {
                                    recognized.insertAdjacentHTML("beforeend", `
                                            <div class="recognized-preview-container"> 
                                                <div class="success-recognized"></div>
                                                <h6>Recognized</h6>
                                                <img src="${file.full_file_url}" alt="document">
                                        </div>
                                        `)
                                }
                                //If dont have ay flags
                                else {
                                    recognized.insertAdjacentHTML("beforeend", `
                                            <div class="recognized-preview-container">
                                                <img src="${file.full_file_url}" alt="document">
                                            </div>`)
                                }
                            }
                        })
                    }).catch(error => console.error(error))
            }

            //Get list of all medical reports in user upload storage for output
            function getUploadedImages(){
                const storage = firebase.storage().ref(`documents/${currentUserMedId}/uploaded/`)
                storage.listAll()
                    .then(result => {
                        result.items.forEach(imageRef => {
                            imageRef.getDownloadURL()
                                .then(url => {
                                    compareDatabaseRecognizeInfo(url)
                                })
                        })
                    }).catch(error => console.error("Error:", error))
            }

            //Handler to upload pictures to recognizer
            function uploadRecognizeHandler(files) {
                const progressBar = document.querySelector(".progress-bar")
                preview.querySelectorAll(".remove-img").forEach(e => e.remove())
                let idArray = []
                let checker = files.length
                files.forEach(file => {
                    //make unique id for each new picture
                    let uniqueId = Date.now() + Math.random().toString(36).substring(2);
                    let extension = ""
                    //Check inputed filetypes
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
                    let uploadTask = storageRef.child(`documents/${currentUserMedId}/uploaded/${uniqueId}${extension}`).put(file)
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
                                idArray.push(downloadURL)
                                progressBar.innerHTML = ""
                                uploadButton.style.display = "none"
                                checker -= 1
                                //When we upload all files go to next step
                                if (checker == 0) {
                                    saveNames(idArray)
                                }
                            })
                        }
                    )
                })
                //Return file names to write it to database
                return idArray
            }

            //Fetch all picture names to save at DB
            function saveNames(arr) {
                fetch(`/portal/api/v1/recognizer`, {
                    method: "POST",
                    headers: {
                        "X-CSRFToken": getCookie("csrftoken")
                    },
                    body: JSON.stringify({
                        files: arr
                    })
                }).finally(() => location.reload())
            }

            //When open pictures for upload you come here
            function previewBeforeUpload(event){
                preview.innerHTML = ""
                files = Array.from(event.target.files)
                uploadButton.addEventListener("click", () => uploadRecognizeHandler(files))
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

            openInput.addEventListener("change", previewBeforeUpload)
            preview.addEventListener("click", removeHandler)
        }

        // When you on family page
        if (window.location.href.indexOf("portal/family") > 1) {
            document.querySelector(".add-member-btn").style.visibility = "hidden"
            const searchMemberButton = document.querySelector(".search-member-btn")
            const removeMemberButton = document.querySelectorAll(".remove-member")
            let idInput = document.getElementById("member-id")

            searchMemberButton.addEventListener('click', () => searchMember(idInput.value, "member"))
            removeMemberButton.forEach(button => {
                button.addEventListener("click", () => removeMember(button.value))
            })
        }

        //When you on index portal page
        if (window.location.href.indexOf("portal/dashboard") > 1) {
            printUserLog(currentUserMedId)
            const vacctinationStatus = document.querySelector(".vaccination-status")
            let info = getStatus()
            async function getStatus(){
                let info = ""
                const passportBase = await db.collection(`users/${currentUserMedId}/passport/`)
                const snapShoot = await passportBase.get()
                snapShoot.forEach(i => {
                    info = i.data()
                })
                return info
            }
            info.then((info) => {
                if (info.vaccinated){
                    vacctinationStatus.insertAdjacentHTML("afterbegin", `
                    <img alt="card page icon" src="https://firebasestorage.googleapis.com/v0/b/medicard-db.appspot.com/o/portal%2Fimg%2Fimunity.png?alt=media&token=53fe2eba-41f2-45ee-8e89-f8166080c574">
                    <div class="passport-status">
                        <span>You are vaccinated</span>
                        <span>Last vaccination date is ${info.vaccinating_date}</span>
                        <span>Proof document id is: ${info.vaccination_document_id}</span>
                    </div>

                    `)
                }
                else {
                    vacctinationStatus.insertAdjacentHTML("afterbegin", `
                    <img alt="card page icon" src="https://firebasestorage.googleapis.com/v0/b/medicard-db.appspot.com/o/portal%2Fimg%2Fnot-imunity.png?alt=media&token=34f6511f-0790-4185-ae0a-a3819d81bc92">
                    <span>You are not yet vaccinated</span>
                    `)
                }
            })

        }
        //When you on  covid-19 passport page
        if (window.location.href.indexOf("portal/covidpass") > 1) {
            const uploadButton = buttonMaker("button", ["btn", "btn-outline-info"], "Upload conformation")
            const passportPageButtons = document.querySelector(".passport-page-buttons")
            const inputConformationFile = document.querySelector("#confirmation-file-input")
            const profileUserId = document.querySelector(".id-number")
            const requested_med_id = profileUserId.innerHTML.trim()
            console.log(requested_med_id)

            //Get data from Firebase
            const covidPassportData = async function getPassportData() {
                let result = ""
                const passportBase = db.collection(`users/${requested_med_id}/passport/`)
                await passportBase.get()
                    .then((querySnapshot) => {
                        querySnapshot.forEach((doc) => {
                            // doc.data() is never undefined for query doc snapshots
                            result = doc.data()

                        })
                    }).catch(err => console.error(err))
                return result
            }
            covidPassportData()
                .then(data => drawPassport(data, requested_med_id))

            //CHECK IF USER LOOKING FOR HIS OWN PASSPORT
            if (requested_med_id === currentUserMedId){
                //Upload new information handler
                uploadButton.addEventListener("click", () => inputConformationFile.click())
                inputConformationFile.addEventListener("change", event => {
                    let files = Array.from(event.target.files)
                    uploadExistingPassport(files[0], currentUserMedId)
                })
            passportPageButtons.insertAdjacentElement("beforeend", uploadButton)
            }

        }
    }
)

//Show user log for user at dashboard page
function printUserLog(userId){
    console.log(userId)
    const userLogInput = document.querySelector(".user-log")
     db.collection(`users/${userId}/log/`).orderBy("time").limit(4)
        .get()
        .then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
                userLogInput.insertAdjacentHTML("afterbegin", `
                <div class="log-string">
                    <div class="log-date"><strong>Date:</strong> ${doc.data().time}</div>
                    <div class="log-event"><strong>Event:</strong> ${doc.data().event}</div>
                </div>
                `)
            })
        })
}

//Save event to user lo
async function saveUserLog(userID, event){
    console.log("Start save log......")
    await db.collection(`users/${userID}/log/`).add({
        event: event,
        time: Date(),
    })
        .then((docRef) => {
            console.log("Document written with ID: ", docRef.id);
        })
        .catch((error) => {
            console.error("Error adding document: ", error);
        })
}

//Function for open preview image modal, and insert image
function previewWorker (){
            const recognized = document.querySelector(".recognized-images")
            const modalPreview = document.querySelector(".modal-preview")
            //When click on image open preview in modal window
            recognized.addEventListener("click" , event => {
                if (!event.target.src){
                    return
                }
                modalPreview.style.display= "block"
                modalPreview.insertAdjacentHTML("afterbegin", `<div class="modal-preview-image"><img src=${event.target.src} alt="text"></div>`)
                console.log(event.target.src)
            })
            //Hide and clean modal container on second click
            modalPreview.addEventListener("click", () => {
               modalPreview.innerHTML = ""
               modalPreview.style.display = "none"
           })
}

//Function for remove active class
function removeActiveClass(className){ document.querySelectorAll(`.${className}`).forEach(el => el.classList.remove("active")) }

//    Write all data to FireStore
function writeDocToFireStore(currentUserMedId,contextData) {
    db.collection(`users/${currentUserMedId}/reports/`).add(contextData())
        .then((docRef) => {
            console.log("Document written with ID: ", docRef.id);
        })
        .catch((error) => {
            console.error("Error adding document: ", error);
        })
        .finally(() => location.reload())
}

//Handler to update profile information at DB
function updateProfileHandler(profileBody, userId) {

    saveUserLog(userId,"Update user profile")
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

//Search documents in firestore
function getFromFireStore(med_id, from, to) {
    const searchResultContainer = document.querySelector(".search-record-container")
    searchResultContainer.innerHTML = ""
    db.collection(`users/${med_id}/reports/`)
        .where('date', '>', from)
        .where('date', '<', to)
        .get()
        .then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
                searchResultContainer.insertAdjacentHTML("beforeend", `
        <div class="result-item" data-id="${doc.id}">
            <span><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-clipboard-check" viewBox="0 0 16 16">
                  <path fill-rule="evenodd" d="M10.854 7.146a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708 0l-1.5-1.5a.5.5 0 1 1 .708-.708L7.5 9.793l2.646-2.647a.5.5 0 0 1 .708 0z"/>
                  <path d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1v-1z"/>
                  <path d="M9.5 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h3zm-3-1A1.5 1.5 0 0 0 5 1.5v1A1.5 1.5 0 0 0 6.5 4h3A1.5 1.5 0 0 0 11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3z"/>
                </svg>
            </span>
            <div class="record-date"><span>${JSON.stringify(doc.data().date)}</span></div>
            <div class="record-name"><span>${JSON.stringify(doc.data().report_name)}</span></div>
        </div>
        `)
            })
        })
}

//load list of people who have access to your page
function getAccessList() {
    const accessList = document.querySelector(".access-list")
    accessList.innerHTML = ""
    fetch(`/portal/api/v1/access`)
        .then(response => response.json())
        .then(result => {
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
function getUserAllergenHandler(current_user_id, requested_med_id) {
    const insertList = document.querySelector("#user-allergen-list")
    insertList.innerHTML = ""
    fetch(`/portal/api/v1/allergens/${requested_med_id}`)
        .then(response => response.json())
        .then(result => {
            result.forEach(al => {
                if (current_user_id === requested_med_id) {
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
                //Get current user ID from django template
                const currentUserMedId = JSON.parse(document.querySelector('#user-med-id').textContent)
                getUserAllergenHandler(currentUserMedId, requested_med_id)
            })
    })
}

//Set (add) new allergens for user at profile page
function setUserAllergenHandler(allergen, requested_med_id) {
    const currentUserMedId = JSON.parse(document.querySelector('#user-med-id').textContent)
    console.log("Send Post Request to Backend", requested_med_id)
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
        .then(result => console.log(result))
        .catch(error => console.error(error))
        .finally(() => {
            getUserAllergenHandler(currentUserMedId, requested_med_id)
        })
}

//remove family member at family page
function removeMember(id) {
    //Get current user ID from django template
    const currentUserMedId = JSON.parse(document.querySelector('#user-med-id').textContent)
    saveUserLog(currentUserMedId ,`Remove family member with id ${id}`).then(() => {
       fetch('/portal/api/v1/family/remove', {
        method: "DELETE",
        headers: {
            "X-CSRFToken": getCookie("csrftoken")
        },
        body: JSON.stringify({
            id: id
        })
    })
           .catch(error => console.error(error))
           .finally(() => {
                  location.reload()
           })
    })

}

//Search family member at family page
function searchMember(id, options) {
    //Get current user ID from django template
    const currentUserMedId = JSON.parse(document.querySelector('#user-med-id').textContent)

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
                addMemberButton.addEventListener("click", () => {
                    saveUserLog(currentUserMedId ,`Add family member with id ${id}`)
                        .then (() => addMember(id))
                })
            }
            if (options == "access")
                addMemberButton.addEventListener("click", () => {
                    saveUserLog(currentUserMedId ,`Add  member with id ${id} to your access list`)
                    .then (()=> addAccess(id))
                })
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

//Helper function for make buttons
function buttonMaker(tag, classlist, textcontent) {
    const button = document.createElement(tag)
    button.classList.add(...classlist)
    button.textContent = textcontent
    return button
}
