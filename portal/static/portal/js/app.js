function formatBytes(bytes, decimals) {
    if(bytes== 0)
    {
        return "0 Byte"
    }
    const k = 1024; //Or 1 kilo = 1000
    const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + " " + sizes[i]
}

document.addEventListener('DOMContentLoaded', function () {


    //Firebase Config for upload pictures
    const firebaseConfig = {
        apiKey: "AIzaSyCKGs3Hy8wmIT7M4OJ2SYWlwSVV2-d3TNg",
        authDomain: "medicard-db.firebaseapp.com",
        projectId: "medicard-db",
        storageBucket: "medicard-db.appspot.com",
        messagingSenderId: "872483625762",
        appId: "1:872483625762:web:060663b337fb53641fe37b",
        measurementId: "G-YQ7GVST827"
    };


    //Cards page section
    if (window.location.href.indexOf("portal/cards") > 1) {
        let files = []
        const options = {
            multiply: true,
            accepttype: [".jpg", ".png", ".jpeg", ".gif"]
        }

        const openInput = document.querySelector("#file-input")
        const uploadButton = document.createElement("button")
        const preview = document.querySelector(".already-uploaded")
        const headerUpload = document.querySelector(".header-upload")
        if (options.multiply) {
            openInput.setAttribute("multiple", true)
        }

        if (options.accepttype && Array.isArray(options.accepttype)) {
            openInput.setAttribute("accept", options.accepttype.join(","))
        }
        uploadButton.classList.add("btn")
        uploadButton.classList.add("btn-outline-primary")
        uploadButton.textContent = `Upload`
        headerUpload.insertAdjacentElement("beforeend", uploadButton)
        uploadButton.addEventListener("click", () => openInput.click())


        const changeHandler = (event) => {
            preview.innerHTML = ""
            files = Array.from(event.target.files)
            files.forEach(file => {
                if (!file.type.match("image")) {
                    return
                }

                const reader = new FileReader
                reader.onload = ev => {
                    preview.insertAdjacentHTML("beforeend",
                        `<div class="img-preview-container" ">
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

        const removeHandler = event => {
            if (!event.target.dataset.name){
                return
            }
            const {name} = event.target.dataset
            files.filter(file => file.name != name)

            const remove = document.querySelector(`[data-name="${name}"`).closest(".img-preview-container")
            remove.remove()
        }


        openInput.addEventListener("change", changeHandler)
        preview.addEventListener("click", removeHandler)



    }


    document.querySelector("#add-member-btn").style.visibility = "hidden"
    const searchMemberButton = document.getElementById("searach-member-btn")
    let idInput = document.getElementById("member-id")
    searchMemberButton.addEventListener('click', () => searchMember(idInput.value))

    const removeMemberButton = document.querySelectorAll(".remove-member")
    removeMemberButton.forEach(button => {
        const memberToRemoveId = button.value
        button.addEventListener("click", () => removeMember(memberToRemoveId))
    })


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


})

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

