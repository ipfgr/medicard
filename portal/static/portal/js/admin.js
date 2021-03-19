const firebaseConfig = {
    apiKey: "AIzaSyCKGs3Hy8wmIT7M4OJ2SYWlwSVV2-d3TNg",
    authDomain: "medicard-db.firebaseapp.com",
    projectId: "medicard-db",
    storageBucket: "medicard-db.appspot.com",
    messagingSenderId: "872483625762",
    appId: "1:872483625762:web:060663b337fb53641fe37b",
    measurementId: "G-YQ7GVST827"
}

//Initialization Firebase Datastore
const app = firebase.initializeApp(firebaseConfig);
const storageRef = firebase.storage().ref();

//Initialization tesseract worker
const worker = Tesseract.createWorker()


//Options thats can selected in input unit field
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


document.addEventListener('DOMContentLoaded', () => {
    const ocrButton = document.querySelector("#ocr-button")
    const filesList = document.querySelector(".files-list")
    const originalInsert = document.querySelector(".original-picture")
    const ocrMessage = document.querySelector(".ocr-message")
    const ocrBody = document.querySelector(".ocr-body")

    ocrButton.addEventListener("click", () => {
        const fileLink = document.querySelector("#image-to-work").src
        if (!fileLink) {
            return
        }
        //Get image from firebase and convert to base64
        const getBase64FromUrl = async (url) => {
            const data = await fetch(url, {
                method: 'GET',
                mode: 'cors',
            })
            const blob = await data.blob();
            return new Promise((resolve) => {
                const reader = new FileReader();
                reader.readAsDataURL(blob);
                reader.onloadend = function () {
                    const base64data = reader.result;
                    resolve(base64data);
                }
            });
        }

        //Start OCR from image
        getBase64FromUrl(fileLink).then(result => {

             (async () => {
                 ocrMessage.innerHTML = "Loading OCR worker..."
                 ocrButton.style.display = "none"
                 await worker.load();
                 ocrMessage.innerHTML = "Load Language..."
                 await worker.loadLanguage('vie');
                 ocrMessage.innerHTML = "Initialize App..."
                 await worker.initialize('vie');
                 ocrMessage.innerHTML = "Recognizing..."
                 const {data: {text}} = await worker.recognize(result);
                 ocrMessage.innerHTML = "Ready...."
                 ocrBody.insertAdjacentHTML("beforeend", `<textarea> ${text} </textarea>`)
                 await worker.terminate();
            })();
        })




    })
    getUnrecognizedFilesList()

    async function getUnrecognizedFilesList() {
        await fetch(`portal/api/v1/get_unrecognized`)
            .then(response => response.json())
            .then(result => {
                printResults(result)
            })
            .catch(err => console.error(err))
    }

    function printResults(data) {
        data.forEach(item => {
            filesList.insertAdjacentHTML("afterbegin", `
            <li data-url="${item.full_file_url}" data-id="${item.user_id}">User ID ${item.user_id} : This user have not recognized file uploaded at: ${item.upload_date}</li>
            `)
        })
    }

    filesList.addEventListener("click", event => {
        if (!event.target.dataset) {
            return
        }
        ocrMessage.style.display = "block"
        ocrMessage.innerHTML = "You can work with Document OCR Tool"
        ocrButton.style.display = "block"
        originalInsert.innerHTML = ""
        originalInsert.innerHTML = `<img id="image-to-work" src="${event.target.dataset.url}">`
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


})