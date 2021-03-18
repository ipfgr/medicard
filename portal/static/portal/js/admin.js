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

document.addEventListener('DOMContentLoaded', () => {
    const filesList = document.querySelector(".files-list")

    getUnrecognizedFilesList()

    async function getUnrecognizedFilesList() {
        await fetch(`portal/api/v1/get_unrecognized`)
            .then(response => response.json())
            .then(result => {
                console.log(result)
                printResults(result)
            })
            .catch(err => console.error(err))
    }

    function printResults(data) {
        data.forEach(item => {
            filesList.insertAdjacentHTML("afterbegin", `
            <li data-id="${item.full_file_url}">User ID ${item.user_id} : File name ${item.full_file_url}</li>
            `)
        })
    }

    filesList.addEventListener("click", event => {
        if (!event.target.dataset) {
            return
        }
        console.log(event.target.dataset.id)
    })

})