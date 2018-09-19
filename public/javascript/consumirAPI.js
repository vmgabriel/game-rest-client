var ACCESS_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.IwdaBxBHvBMLp6Ig4t4detTnQOiE2VN5CIF-09QQ-G0";
var accessControl = "*";
var accessHeaders = "Origin, X-Request-Width, Content-Type, Accept";

function getAPI(url) {
    var test = $.ajax({
        "method":   "GET",
        "url":   url,
        "dataType": "json",
        "async": true,
        "headers": {
            'Authorization': ACCESS_TOKEN,
            'Access-Control-Allow-Origin': accessControl,
            'Access-Control-Allow-Headers': accessHeaders
        }
    });
    return test;
}


function postAPI(url, data) {
    var test = $.ajax({
        "method":   "POST",
        "url":   url,
        "data": data,
        "dataType": "json",
        "async": true,
        "headers": {
            'Authorization': ACCESS_TOKEN,
            'Access-Control-Allow-Origin': accessControl,
            'Access-Control-Allow-Headers': accessHeaders
        }
    });
    return test;
}

function putAPI(url, data) {
    var test = $.ajax({
        "method":   "PUT",
        "url":   url,
        "data": data,
        "dataType": "json",
        "async": true,
        "headers": {
            'Authorization': ACCESS_TOKEN,
            'Access-Control-Allow-Origin': accessControl,
            'Access-Control-Allow-Headers': accessHeaders
        }
    });
    return test;
}

function deleteAPI(url, data) {
    var test = $.ajax({
        "method":   "DELETE",
        "url":   url,
        "dataType": "json",
        "async": true,
        "headers": {
            'Authorization': ACCESS_TOKEN,
            'Access-Control-Allow-Origin': accessControl,
            'Access-Control-Allow-Headers': accessHeaders
        }
    });
    return test;
}


function redireccionar() {
    window.location="http://localhost:3000/error";
}

function obtenerID(url) {
    var id = url.substring(url.lastIndexOf('/') + 1);
    console.log(id);
    return id;
}
