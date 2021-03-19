//Get information from Database and draw to Covid-19 page
function drawPassport(data,medId, currentUserMedId) {
    const passportContainer = document.querySelector(".passport-page-container")
    const avatarLink = document.querySelector(".avatar").dataset.link
    const validTo = new Date()
    console.log(validTo)
    if (data.vaccinated) {

        passportContainer.insertAdjacentHTML("afterbegin", `
                    <div class="passport-container static-card">
                        <div class="passport-top-level">
                            <div class="passport-photo ">
                                <img alt="avatar" src="${avatarLink}">
                            </div>
                            <div class="passport-info">
                                <div class="name"><strong>Name:</strong> ${data.name}</div>
                                <div class="name"><strong>Birth:</strong> ${data.birth}</div>
                                <div class="passport-status">
                                    <span><strong>Status:</strong></span>
                                    <img alt="status"
                                         src="https://firebasestorage.googleapis.com/v0/b/medicard-db.appspot.com/o/portal%2Fimg%2Fimunity.png?alt=media&token=53fe2eba-41f2-45ee-8e89-f8166080c574">
                                </div>
                            </div>
                            <div class="passport-label">
                                <button class="btn btn-outline-warning" onclick="window.print()">Print</button>
                            </div>
                        </div>
                        <div class="passport-bottom-level">
                            <div class="name"><strong>Medicard ID:</strong> ${medId}</div>
                            <div class="name"><strong>Passport Number:</strong> ${data.vaccination_document_id}</div>
                            <div class="name"><strong>Vaccination date:</strong> ${data.vaccinating_date}</div>
                        </div>
                    </div>
                `)
    } else {
        passportContainer.insertAdjacentHTML("afterbegin", `
                <div class="passport-container static-card">
                    <div class="passport-top-level">
                        <div class="passport-photo ">
                            <img alt="avatar" src="${avatarLink}">
                        </div>
                        <div class="passport-info">
                            <div class="name"><strong>Name:</strong> ${data.name}</div>
                            <div class="name"><strong>Birth:</strong> ${data.birth}</div>
                            <div class="passport-status">
                                <span><strong>Status:</strong></span>
                                <img alt="status"
                                     src="https://firebasestorage.googleapis.com/v0/b/medicard-db.appspot.com/o/portal%2Fimg%2Fnot-imunity.png?alt=media&token=34f6511f-0790-4185-ae0a-a3819d81bc92">
                            </div>
                        </div>
                        <div class="passport-label">
                            <button class="btn btn-outline-warning" onclick="window.print()">Print</button>
                        </div>
                    </div>
                    <div class="passport-bottom-level">
                        <div class="name"><strong>Medicard ID:</strong> ${medId}</div>
                        <div class="name"><strong>Passport Number:</strong>Not yet vaccinated</div>
                        <div class="name"><strong>Valid until:</strong>Not yet vaccinated</div>
                    </div>
                </div>
                `)
    }

}


//Upload existing documents for database, from page Covid-19 Passport
function uploadExistingPassport(file, currentUserMedId) {
    if (validateSize(file, 2)) {
            const uploadProgress = document.querySelector(".upload-progress")
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
            let uploadTask = storageRef.child(`documents/${currentUserMedId}/passport/${uniqueId}${extension}`).put(file)
            uploadTask.on('state_changed',
                (snapshot) => {
                    // Observe state change events such as progress, pause, and resume
                    // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
                    let progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
                    uploadProgress.innerHTML = `<div id="progress">Upload is  ${progress.toFixed(0)} % done</div>`
                    console.log('Upload is ' + progress.toFixed(0) + '% done');
                    switch (snapshot.state) {
                        case firebase.storage.TaskState.PAUSED: // or 'paused'
                            console.log('Upload is paused')
                            break
                        case firebase.storage.TaskState.RUNNING: // or 'running'
                            console.log('Upload is running')
                            break
                    }
                    },(error) => {
                        console.error(error)
                    },
                        () => {
                        alert("Success uploaded")
                            uploadProgress.innerHTML = '';
                        uploadProgress.innerHTML = `<h6>You can upload new vaccination conformation or scan of existing covid-19 passport or vaccination certificate,
                                                         to check and update your online passport information
                                                    </h6>`
                    })
    }
}