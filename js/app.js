const api_url = "http://inec.sg/assignment/retrieve_records.php";

function displayPage(divID) {
    var pages = document.getElementsByClassName("page");

    for (var i = 0; i < pages.length; i++) {
        if (pages[i].id == divID) {
            pages[i].style = "display:block;";
        } else {
            pages[i].style = "display:none;";
        }
    };

    if (divID === "page_home")
        document.querySelector("#span_header_date").innerHTML = formattedDate();

}

function formattedDate(d = new Date) {
    let month = String(d.getMonth() + 1);
    let day = String(d.getDate());
    const year = String(d.getFullYear());

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    var hour = d.getHours();

    return `${day}/${month}/${year} ${d.getHours()}:${d.getMinutes()}`;
}

var setProductName = (name) => sessionStorage.productName = name;

var getProductName = () => sessionStorage.productName;

var display_productItem = (productItem) => {

    displayPage("page_details");

    console.log("productName == " + productItem.name);

    setProductName(productItem.name);

    var itemResult =
        `<div id="div_product_details_img">
        <img src="${productItem.image}"></div>
    <div id="div_product_details_data">
        <div class="div_product_details_data_cell">
            <span class="product_details_data_name">Brand</span><br>${productItem.brand}
        </div>
        <div class="div_product_details_data_cell">
            <span class="product_details_data_name">Type</span><br>${productItem.type}
        </div>
        <div class="div_product_details_data_cell">
            <span class="product_details_data_name">Install?</span><br>${productItem.installation}
        </div>
        <div class="div_product_details_data_cell">
            <span class="product_details_data_name">Price</span><br>$${productItem.price}
        </div>` ;

    // update back page
    document.querySelector("#product_name").innerHTML = productItem.name;

    document.querySelector("#div_product_details").innerHTML = itemResult;
}

var display_productList = (productArray) => {
    var itemResult = "";

    // store into the localStorage
    localStorage["productList"] = JSON.stringify(productArray);

    for (let i = 0; i < productArray.length; i++) {
        let item = productArray[i];
        console.log(item);
        itemResult += `<li class="li_product_item" id="product_${i}">
        <div class="li_product_image"><img src=${item.image}></div>
        <div class="li_product_name">${item.brand}, ${item.name}<br><span class="li_product_price">$${item.price}</span></div>
        </li>`
    }

    document.querySelector("#ul_products_list").innerHTML += itemResult;

    for (let i = 0; i < productArray.length; i++) {
        document.querySelector(`#product_${i}`).addEventListener('click',
            () => { console.log("*****Is here ****"); display_productItem(productArray[i]); }, false);
    }
}

var currPostion = (latLng) => { return { lat: latLng.lat(), lng: latLng.lng() } };

var getProductImage = (productName) => {

    var productArray = JSON.parse(localStorage["productList"]);

    for (let i = 0; i < productArray.length; i++) {
        if (productArray[i].name === productName)
            return productArray[i].image;
    }

    return -1;
}

var loadProductIcon = (imgUrl) => {

    var icon = {
        url: imgUrl, // url
        scaledSize: new google.maps.Size(50, 50), // size
    };
    return icon;
}

var getProductMarkers = (productName) => {

    var allMarkers;

    if (!localStorage[productName] == false) {
        allMarkers = JSON.parse(localStorage[productName]);
        if (!allMarkers)
            return allMarkers;
    }
    else return null;

    return allMarkers.filter(function (item) {
        return item.name === productName;
    });
}

function delMarkerCB(event) {

    console.log("delMarkerCB");
    console.log("location : " + event.latLng);
    console.log("this.location : " + this.location);

    if (currPostion(event.latLng).lat === this.location.lat &&
        currPostion(event.latLng).lng === this.location.lng) {

        this.setMap(null);

        var productName = getCurrentProductName();

        console.log("delMarkerCB :  productName " + productName);
        var markers = getProductMarkers(productName);

        var currentMarker = this;

        var idx = markers.findIndex(function (item) {
            return (currentMarker.location.lat == item.location.lat) && (currentMarker.location.lng && item.location.lng);
        });
        markers.splice(idx, 1)
        localStorage[productName] = JSON.stringify(markers);


        var UImarkers = getUIMarkersArray(productName);
        var idx = UImarkers.findIndex(function (item) {
            return (currentMarker.location.lat == item.location.lat) && (currentMarker.location.lng && item.location.lng);
        });
        UImarkers.splice(idx, 1)

    }

}

var createMapMarker = (productName, position) => {

    console.log("--createMapMarker--")
    var imgUrl = getProductImage(productName);
    var marker = new google.maps.Marker({
        position: position,
        map: getMap(),
        icon: loadProductIcon(imgUrl),
        label: productName

    });
    marker.location = position;
    return marker;
}

var printMarkers = (myMarkers) => {
    myMarkers.forEach(function (element) {
        console.log(JSON.stringify(element));
    });
}

function addMarkerCB(event) {
    let markers = [];
    let UImarkers = [];

    var productName = getCurrentProductName();

    var marker = createMapMarker(productName, currPostion(event.latLng));
    console.log("addMarkerCB");

    if (!localStorage[productName]) {
        localStorage[productName] = JSON.stringify(markers);
        console.log("1.   create UImarkers here")
        UImarkers = getUIMarkersArray(productName);
    }
    else {
        markers = getProductMarkers(productName);
        console.log("2.  create UImarkers here");
        UImarkers = getUIMarkersArray(productName);
    }


    // each marker name and location to be store in localStorage
    markers.push({ name: marker.label, location: marker.location })
    localStorage[productName] = JSON.stringify(markers);
    marker.addListener('click', delMarkerCB);

    // each marker name and location to be store in UIMarkersArray
    UImarkers.push(marker);
    getMap().UImarkers[productName] = UImarkers;

}

var getCurrentPosition = () => {
    let mapPosition;

    navigator.geolocation.getCurrentPosition((position) => {
        mapPosition = { lat: position.coords.latitude, lng: position.coords.longitude };
    });

    return mapPosition;
}

var createMap = (mapPosition) => {

    var map = getMap();

    console.log(mapPosition);

    if (!map) {
        console.log("create Map here")
        map = new google.maps.Map(div_product_map, {
            center: mapPosition,
            zoom: 15
        });
        map.addListener('click', addMarkerCB);

        // store map
        div_product_map.map = map;
    }
    console.log(map)
    return map;
}



function initMap() {

    navigator.geolocation.getCurrentPosition((position) => {

        var mapPosition = { lat: position.coords.latitude, lng: position.coords.longitude };

        var map = createMap(mapPosition);

        var marker = new google.maps.Marker({
            position: mapPosition,
            map: map
        });

        loadProductsLocations();
    });
}


function AjaxLoadMessage() {

    var settingsObject = {
        dataType: "json",
        method: "GET"
    };

    $.ajax(api_url, settingsObject)
        .done(function (returnObject) {
            //  console.log(returnObject) ;
            display_productList(returnObject.products);
        })
        .fail(function (errorObject) {
            console.log(errorObject)
        })
        .always(function () {
            //happens regardless what happens
        });
}


var loadProductsLocations = () => {

    var productName = getCurrentProductName();

    if (!localStorage[productName] == false) {
        var oldMarkerList = JSON.parse(localStorage[productName]);
        console.log("oldMarkerList == " + oldMarkerList);

        let UImarkers = getUIMarkersArray(productName);


        if (oldMarkerList.length > 0 && UImarkers.length==0) {
            console.log("Need to create UIMarkers here")
            for (let i = 0; i < oldMarkerList.length; i++) {
               
                let marker = createMapMarker(oldMarkerList[i].name,oldMarkerList[i].location) ;
                
                UImarkers.push(marker) ;
            }

            if(oldMarkerList.length == getUIMarkersArray(productName).length )
                console.log("UIMarkerArray Fully Updated!!") ;
        }
        else if (oldMarkerList.length > 0 && oldMarkerList.length == UImarkers.length) { 
                console.log("Map Markers in sync with local Storage!!")
        }
    }

    if (getMap() !== undefined)
        displayMarkersOnMap(getMap(), productName);

}

var getMap = () => {
    var div_product_map = document.getElementById("div_product_map");
    return div_product_map.map
}

var getUIMarkersArray = (productName) => {
    console.log(" ^^^^ " + getMap());
    if (!getMap()) {
        return null;
    }
    if (!getMap().UImarkers) {
        console.log("create UIMarker Array here");
        console.log(productName);
        getMap().UImarkers = new Object();
    }

    if (!getMap().UImarkers[productName])
        getMap().UImarkers[productName] = [];

    return getMap().UImarkers[productName];
}

var getCurrentProductName = () => sessionStorage.productName;

var displayMarkersOnMap = (map, productName) => {
    var markersArray = getUIMarkersArray(productName);
    if(!markersArray)
        return null ;
    console.log("---displayMarkersOnMap---");
    console.log(markersArray);
    console.log(productName);
    if (markersArray.length>0) {
        for (let i = 0; i < markersArray.length; i++) {
            markersArray[i].setMap(map);
        }
    }
}

var saveProductsLocations = () => {
    var productName = getCurrentProductName();
    console.log("----saveProductsLocations-----")

    google.maps.Map.prototype.clearOverlays = function () {
        console.log("clear all markers on map here!!")
        displayMarkersOnMap(null, productName);
    }

    getMap().clearOverlays();


}

function AjaxInit() {

    AjaxLoadMessage();
}

var getProductNameArray = () => {
    var productArray = JSON.parse(localStorage["productList"]);
    if (!productArray)
        return null;

    var productNameArray = [];

    for (let i = 0; i < productArray.length; i++)
        productNameArray.push(productArray[i].name);

    return productNameArray;
}

var indexPage = () => {

    AjaxInit();

    document.querySelector("#btn_product_details_back").addEventListener('click',
        () => { console.log(""); displayPage("page_home") }, false);


    document.querySelector("#btn_product_map_back").addEventListener('click',
        () => { saveProductsLocations(); displayPage("page_details") }, false);


    document.querySelector("#div_product_details_footer").addEventListener('click',
        () => { console.log("**** here ****");  initMap(); displayPage("page_map") }, false);

    displayPage("page_home");
}   