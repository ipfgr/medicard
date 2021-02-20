document.addEventListener('DOMContentLoaded', function () {
    document.querySelector("#add-member-btn").style.visibility="hidden"
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
            if (result.message == "Not correct ID"){
                resultDiv.innerHTML = "Not Correct ID"
                    addMemberButton.style.visibility="hidden";

            }
            else{

                resultDiv.innerHTML = `Find user: ${JSON.stringify(result)} `
                addMemberButton.style.visibility="visible";

            }

        }).catch(error => console.log(error))
        .finally(()=> {

            document.querySelector("#add-member-btn").addEventListener("click", () => fetchPost(id))

        })
    function fetchPost(id){
        console.log("Send Post Request to Backend")
        fetch(`/portal/family/add`, {
                        method: "POST",
                        headers: {
                        "X-CSRFToken": getCookie("csrftoken")
                        },
                        body: JSON.stringify({
                            medid: id
                        })
                    }).catch(error =>console.log(error))
    }
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

