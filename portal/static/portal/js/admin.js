
//Initialization tesseract worker
const worker = Tesseract.createWorker()

document.addEventListener('DOMContentLoaded', () => {
    const ocrButton = document.querySelector("#ocr-button")
    const filesList = document.querySelector(".files-list")
    const originalInsert = document.querySelector(".original-picture")
    const ocrMessage = document.querySelector(".ocr-message")
    const ocrBody = document.querySelector(".ocr-body")
    const newReport = document.querySelector(".modal-container")
    const documentId = document.querySelector('#generated-doc-id')
    const addLineButton = document.querySelector("#add-line")
    const saveReport = document.querySelector("#submit-record")
    const inputDivPlace = document.querySelector("#input0")
    let userIdFOrCurrentDocument = ""

    newReport.style.display = "none"

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

    //Open file and add new report template
    filesList.addEventListener("click", event => {
        if (!event.target.dataset) {
            return
        }
        //Write opened document user id to global variable
        userIdFOrCurrentDocument = event.target.dataset.id
        //Show report inputs
        newReport.style.display = "block"
        //Show ocr welcome message and buttons
        ocrMessage.style.display = "block"
        ocrMessage.innerHTML = "You can work with Document OCR Tool"
        ocrButton.style.display = "block"
        //Clean and insert image to page
        originalInsert.innerHTML = ""
        originalInsert.innerHTML = `<img id="image-to-work" src="${event.target.dataset.url}">`
        //Insert new generated document ID
        documentId.innerHTML = documentIdGenerator()
    })

//Add line to report modal
    addLineButton.addEventListener("click", () => {
        //set limit of add input fields
        inputDivPlace.insertAdjacentHTML("beforeend", `
                <div class="input-container" >
                    <input type="text" name="parameter" class="custom-input body-input" placeholder="Parametr">
                    <input type="text" name="result" class="custom-input body-input" placeholder="Result">
                    <select name="select" class="custom-input body-input">
                        ${selectOptions}
                    </select>
                    <input type="text" name="range" class="custom-input body-input" placeholder="Normal Range">
                </div>
                    `)
    })



    //Handler for save input results when press save button
    saveReport.addEventListener("click", () => {
        const topInputs = document.querySelectorAll(".top-input")
        const summary = document.querySelector(".summary")
        //array for images links
        let userMedId = async () =>
            await fetch(`portal/api/v1/getuser/${userIdFOrCurrentDocument}`)
                .then(data => data.json())

        userMedId().then(result => {
            if (validateResult(topInputs)) {
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
                                med_id: result,
                                document_id: documentId.innerHTML,
                                summary: summary.value,
                            }
                        );
                    topInputs.forEach(input => {
                        context[input.name] = input.value
                    })
                    return context
                }
                //Write to fireStore
                recognizeFlagSet()
                writeDocToFireStore(result, contextData)
            }
            //Check if important data [ Name, date, hospital and address inputed ]
            else console.log("not valid")
        })
    })

})


//Set flag to recognize for file
function recognizeFlagSet() {
    const fileLink = document.querySelector("#image-to-work").src
    console.log(fileLink)
    fetch(`portal/api/v1/update_status`, {
        method: "PATCH",
        headers: {
            "X-CSRFToken": getCookie("csrftoken")
        },

        body: JSON.stringify({
            url: fileLink
        })
    })
        .then(response => response.json())
        .then(result => console.log(result))
        .catch(error => console.log(error))
}

