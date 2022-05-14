/**
 * @author ANTOONS Miguel
 * @date 24-JUNE-2020
 * @update JULY-2020 -> AUGUST-2020 adding capability to save project with client   LINES OF CODE : 529 without comments, 655 with comments
 */

"use strict";

document.addEventListener('DOMContentLoaded', startup);

/**
 * block to prevent a clicked button from staying focused after the click
 */
document.addEventListener('click', function(e) {
    if(document.activeElement.toString() === '[object HTMLButtonElement]'){
        document.activeElement.blur();
    }
});

let Projects = [];      //Array which will contain the projects
let Clients = [];       //Array which will contain the clients
let nbRow = 0;          //Variable which will contain the number of rows of the project
let color = "red";      //Variable which will contain the color chosen by the user to apply on a textarea on double click event
let pressTimer;         //Variable which will contain the timer for long press at function boldText()
let firstTime = true;   //Variable which turns to false from the moment a new project is opened or created
let activate = false;   //Variable which turns to true from the moment a new project is opened or created
let clientID = 'nothing';    //Variable which will contain the ID of the client on whose project the user is working on

/**
 * STARTUP
 */

/**
 * First function to execute, it receives the projects and clients (with an API request) and stores them in variables Projects and Clients.
 * It then puts the projects in an array so that the user cans select and open one of them
 */
function startup(){
    let xhrProjects = new XMLHttpRequest();
    let xhrClients = new XMLHttpRequest();

    xhrProjects.open("GET", '/serv_getProjects', true);
    xhrClients.open("GET", '/serv_getClients', true);

    xhrProjects.onload = function () {
        let projectArray = [];
        let HTMLString = "";
        Projects = JSON.parse(xhrProjects.responseText);

        for (let i  = 0 ; i < document.getElementsByClassName('propositionLabel').length ; i++){
            if(Projects.length > i) {
                document.getElementsByClassName('propositionLabel')[i].innerText = Projects[i]['project_name'];
                document.getElementsByClassName('proposition')[i].onclick = Function('openProject(' + i + ')');
            }
        }

        for (let i in Projects){
            projectArray.push([Projects[i]['project_name'], Projects[i]['company'], Projects[i]['last_name'], Projects[i]['first_name'], i]);
        }

        projectArray.sort();

        for (let e of projectArray){
            HTMLString += "<tr onclick='openProject(" + e[4] + ")'><td class='companyProposition'>" + e[1] + "</td><td class='nameProposition'>" + e[2] + " " + e[3] + "</td><td class='projectNameProposition'>" + e[0] + "</td></tr>"
        }

        document.getElementById('Projects').innerHTML = HTMLString;
    }

    xhrClients.onload = function () {
        Clients = JSON.parse(xhrClients.responseText);
    }

    xhrProjects.send();
    xhrClients.send();
}


/**
 * Function which opens the selected project and prepares the HTML page in order to start editing the project
 * With a loop it puts all the textarea_data at the correct cell indexes
 *
 * @param index {number}    index of the project to search in Projects array
 */
function openProject(index) {
    let count = 0;
    let textareas = JSON.parse(Projects[index]['textarea_data']);

    if(firstTime){
        document.getElementById('startup').remove();
        firstTime = false;
    }

    document.getElementById('saveStatus').innerHTML = "Saved";
    document.getElementById('saveStatus').style.color = "#119B18";
    document.getElementById('clientInfo').innerHTML = "<h2 id='companyTitle'>" + Projects[index]['company'] + "</h2><br><h2 id='clientLastNameTitle'>" + Projects[index]['last_name'] + "</h2> <h2 id='clientNameTitle'>" + Projects[index]['first_name'] + "</h2>";
    document.getElementById('projectTitle').innerText = Projects[index]['project_name'];
    document.getElementById('etiquettes').innerHTML = Projects[index]['HTML_code'];

    clientID = Projects[index]['Client_ID'];
    nbRow = document.getElementById('etiquettes').getElementsByTagName('tr').length / 2;
    document.getElementById('nOfLines').innerHTML = nbRow;

    for (let i of document.getElementsByClassName('fuseCellsCell')){
        i.onmousedown = Function("modifyCell(this, event)");
        i.onmouseover = Function("preview(this, 1, this.colSpan)");
        i.onmouseout = Function("preview(this, 0, this.colSpan)");
        i.oncontextmenu = Function("return false;");
    }

    for (let j of document.getElementsByClassName('etiquette') ){
        for ( let i of j.cells ){
            i.getElementsByTagName('textarea')[0].value = textareas[count][0];

            if (i.getElementsByTagName('textarea')[1] !== undefined){
                i.getElementsByTagName('textarea')[1].value = textareas[count][1];
            }
            count++;
        }
    }
    activate = true;
}

/**
 * Function which creates the UI to create a new project
 * It does so by modifying the UI of the #startup element
 * It also proposes already existing customers and companies in order to help the user
 */
function newProject(){
    let startupElementStyle = document.getElementById('startup').style;
    let companyList = "";
    let clientNameList = "";
    let clientLastNameList = "";
    let uniqueLastName = [];
    let uniqueFirstName = [];
    let uniqueCompany = [];

    for (let i in Clients) {
        uniqueLastName.push(Clients[i]['last_name']);
        uniqueFirstName.push(Clients[i]['first_name']);
        uniqueCompany.push(Clients[i]['company']);
    }

    uniqueLastName = uniqueLastName.filter(function (item, index) {
        return uniqueLastName.indexOf(item) === index;
    });

    uniqueFirstName = uniqueFirstName.filter(function (item, index) {
        return uniqueFirstName.indexOf(item) === index;
    });

    uniqueCompany = uniqueCompany.filter(function (item, index) {
        return uniqueCompany.indexOf(item) === index;
    });

    startupElementStyle.width = "30%";
    startupElementStyle.paddingTop = "2%";
    startupElementStyle.marginLeft = "35%";
    startupElementStyle.marginRight = "35%";
    document.getElementById('startup').innerHTML = "<h1>Nouveau Projet</h1><br><label><input autocomplete='new-password' type=\"text\" list='companyList' class=\"cleanInput\" id=\"company\" placeholder=\"Société (optionelle)\"></label><datalist id='companyList'></datalist><br><label><input type=\"text\" autocomplete='new-password' class=\"cleanInput\" list='clientNameList' id=\"clientName\" placeholder=\"Prénom du client (optionelle)\"></label><datalist id='clientNameList'></datalist><br><label><input type=\"text\" autocomplete='new-password' class=\"cleanInput\" id=\"clientLastName\" list='clientLastNameList' placeholder=\"Nom du client (obligatoire)\" required></label><datalist id='clientLastNameList'></datalist><br><label><input type=\"text\" autocomplete='new-password' class=\"cleanInput\" id=\"projectName\" placeholder=\"Nom de Projet (obligatoire)\" required></label><br><button id='createProject' class='startupButton' onclick='createProject(true)'>Create</button><button id='cancelProject' class='startupButton' onclick='createProject(false)'>Cancel</button>";

    for (let e of uniqueLastName){
        clientLastNameList += "<option value='"+ e + "' >";
    }

    for (let e of uniqueFirstName){
        clientNameList += "<option value='"+ e + "' >";
    }

    for (let e of uniqueCompany){
        companyList += "<option value='"+ e + "' >";
    }

    document.getElementById('companyList').innerHTML = companyList;
    document.getElementById('clientNameList').innerHTML = clientNameList;
    document.getElementById('clientLastNameList').innerHTML = clientLastNameList;
}

/**
 * Function which will, if authorization granted create a new project.
 * If th permission parameter is true, the function will verify if the entered customer already exists.
 * if it does the client ID is stored in the clientID variable. If not the customer is created and the new client id is stored in the clientID variable.
 * After this the function puts the customer information in the #clientInfo element and calls the showTickets() function
 *
 * if authorization is denied the HTML page is simply reloaded
 *
 * @param permission  {boolean}     gives authorization or not to create a new project
 */
function createProject(permission){
    let company = document.getElementById('company').value;
    let firstName = document.getElementById('clientName').value;
    let lastName = document.getElementById('clientLastName').value;

    if (company === ""){
        company = "Particulier";
    }

    if(permission){
        for (let i of Clients){
            if (i['company'] === company &&  i['last_name'] === lastName && i['first_name'] === firstName){
                clientID = i['Client_ID'];
                break;
            }
        }

        if (clientID === 'nothing') {
            if (confirm('Vous êtes sur le point de créer un nouveau client, veuillez confirmer.\nSociété : ' + company + '\nPrénom : ' + firstName + '\nNom : ' + lastName)) {
                let xhr = new XMLHttpRequest();

                xhr.open("GET", '/serv_insertClient?companyIN=' + company + '&firstName=' + firstName + '&lastName=' + lastName, true);
                xhr.onload = function () {
                    clientID = Number(xhr.responseText);
                    console.log(clientID);
                }

                xhr.send();

                document.getElementById('clientInfo').innerHTML = "<h2 id='companyTitle'>" + company + "</h2><br><h2 id='clientLastNameTitle'>" + lastName + "</h2> <h2 id='clientNameTitle'>" + firstName + "</h2>";
                document.getElementById('projectTitle').innerText = document.getElementById('projectName').value;
                activate = true;
                document.getElementById('saveStatus').innerHTML = 'Unsaved';
                document.getElementById('saveStatus').style.color = "red";
                showTickets();
            }
        }
        else {
            document.getElementById('clientInfo').innerHTML = "<h2 id='companyTitle'>" + company + "</h2><br><h2 id='clientLastNameTitle'>" + lastName + "</h2> <h2 id='clientNameTitle'>" + firstName + "</h2>";
            document.getElementById('projectTitle').innerText = document.getElementById('projectName').value;
            activate = true;
            document.getElementById('saveStatus').innerHTML = 'Unsaved';
            document.getElementById('saveStatus').style.color = "red";
            showTickets();
        }

    }
    else{
        location.reload();
    }
}

/**
 * Function which serves to search a project inside the project table
 * It does so by comparing the user input with the project strings (name, customer, company) and eleminates the ones
 * that aren't the same
 *
 * @param searchText {string} input from the user
 */
function searchProject(searchText){
    let filter = searchText.toUpperCase();
    let tableContent = document.getElementById('Projects').getElementsByTagName("tr");

    for (let i of tableContent){
        if(i.cells[0].innerText.toUpperCase().indexOf(filter) > -1 || i.cells[1].innerText.toUpperCase().indexOf(filter) > -1 || i.cells[2].innerText.toUpperCase().indexOf(filter) > -1){
            i.style.display = "";
        }
        else{
            i.style.display = "none";
        }
    }
}

/**
 * EDIT ACTIONS
 */

/**
 * Function which adds a new row to the project
 * If it is the first time the project is called the #startup element is deleted first.
 * After this, it creates the new row and puts the number of cells chosen by the user inside the row
 */
function showTickets(){
    if(activate) {
        if (firstTime) {
            document.getElementById('startup').remove();
            firstTime = false;
        }

        if (document.getElementById('saveStatus').innerText === 'Saved'){
            document.getElementById('saveStatus').innerHTML = 'Unsaved';
            document.getElementById('saveStatus').style.color = "red";
        }

        let nbColumns = prompt("Entrez le nombre de colonnes désirés : ");

        if (nbColumns === '' || Number(nbColumns) > 18 || Number(nbColumns) < 1) {
            nbColumns = 18;
        }

        nbColumns = Number(nbColumns);

        let newRow1 = document.getElementById('etiquettes').insertRow(-1);
        let newRow2 = document.getElementById('etiquettes').insertRow(-1);
        let newCell1;
        let newCell2;

        newRow1.classList.add('fuseCellsRow');
        newRow2.classList.add('etiquette');

        for (let i = 0; i < nbColumns; i++) {
            newCell1 = newRow1.insertCell(-1);
            newCell2 = newRow2.insertCell(-1);

            newCell1.classList.add('fuseCellsCell');
            newCell2.classList.add('module');

            newCell1.colSpan = 1;
            newCell1.onmousedown = Function("modifyCell(this, event)");
            newCell1.onmouseover = Function("preview(this, 1, this.colSpan)");
            newCell1.onmouseout = Function("preview(this, 0, this.colSpan)");
            newCell1.oncontextmenu = Function("return false;");
            newCell2.innerHTML = "<textarea oninput='insertDelta(this)' onmousedown='boldText(this, 1)' onmouseup='boldText(this, 0)' ondblclick=\"switchColor(this)\" class='input blackNormal' name='input textareaClass' rows='7' cols='5' placeholder='Circuit ...'></textarea><br><textarea oninput='insertDelta(this)' onmousedown='boldText(this, 1)' onmouseup='boldText(this, 0)' ondblclick=\"switchColor(this)\" class='inputNumber blackNormal' name='input textareaClass' rows='1' cols='5' placeholder='N°'></textarea>";

            if (i === 0) {
                nbRow++;
                newCell1.innerHTML = "<span id='rowIndex'>Row : " + nbRow + "</span>";
                document.getElementById('nOfLines').innerText = nbRow;
            }
        }
        document.getElementById('events').innerHTML = "Row has been added,<br>Length of the row : " + nbColumns + " modules";
        document.getElementById('events').style.color = "#11809B";
    }
    else{
        console.log('Veuillez créer un nouveau projet ou ouvrir un projet existant');
    }
}

/**
 * Function which deletes a row if there are at least 2 row in the table
 * if not it generates an error message
 */
function deleteRow(){
    if(activate) {
        if (nbRow > 1) {
            for (let i = 0; i < 2; i++) {
                document.getElementById('ensembleEtiquettes').deleteRow(-1);
            }
            nbRow--;
            document.getElementById('nOfLines').innerHTML = nbRow;
            document.getElementById('saveStatus').innerHTML = "Unsaved";
            document.getElementById('saveStatus').style.color = "red";
            document.getElementById('events').style.color = "#11809B";
            document.getElementById('events').innerHTML = "Row successfully deleted";
        } else {
            document.getElementById('events').style.color = "red";
            document.getElementById('events').innerHTML = "Cannot delete last row";
            console.log("Impossible de supprimer la ligne, il n'y a plus qu'une ligne.\n (cfr. --> Function deleteRow)");
        }
    }
    else{
        console.log('Veuillez créer un nouveau projet ou ouvrir un projet existant');
    }
}

/**
 * Function which depending on the mouse event calls function mergeCell() or function splitCell()
 *
 * @param element        element which was clicked
 * @param event {number} mouseclick event (0 === left click, 2 === right click)
 */
function modifyCell(element, event){
    if(event.button === 0){
        mergeCell(element);
    }
    else if(event.button === 2){
        splitCell(element);
    }
    document.getElementById('saveStatus').innerHTML = "Unsaved";
    document.getElementById('saveStatus').style.color = "red";
}

/**
 * Function which merges two cells if there are at least two cells to merge
 * It does so by deleting a cell and increasing the other cell's colSpan by the deleted cell's colSpan
 * After that the function calls the function preview()
 *
 * @param element       element which was clicked
 */
function mergeCell(element){
    let row = element.parentElement;
    let columnIndexToModify = element.cellIndex;
    if(row.cells.length === columnIndexToModify + 1) {
        document.getElementById('events').style.color = "red";
        document.getElementById('events').innerHTML = "Failed to merge the cell, there aren't other cells to merge with";
        console.log("Erreur, il n'y a aucune colonne à fusionner.\n (cfr. --> Function mergeCell)");
    }
    else{
        let rowIndexToModify = row.rowIndex + 1;
        let columnToDelete = row.getElementsByTagName('td')[columnIndexToModify + 1];
        let columnToFuseContent = row.parentElement.getElementsByTagName('tr')[rowIndexToModify].getElementsByTagName('td')[columnIndexToModify];
        let columnToDeleteContent = row.parentElement.getElementsByTagName('tr')[rowIndexToModify].getElementsByTagName('td')[columnIndexToModify + 1];
        let columnsToAdd = columnToDeleteContent.colSpan;

        columnToDelete.remove();
        columnToDeleteContent.remove();
        element.colSpan += columnsToAdd;
        columnToFuseContent.colSpan += columnsToAdd;

        document.getElementById('events').style.color = "#11809B";
        document.getElementById('events').innerHTML = "Cell merged successfully";
    }

    preview(element, 1, element.colSpan);
}

/**
 * Function which splits a cell if it is big enough to split
 * It reduces the existing cell by half it's colSpan (existing cell receives the rounding error advantage)
 * then a new cell is created next to it and half the colspan of the already existing cell is added to the
 * new cell.
 * At the end the function calls the preview function
 *
 * @param element       element which was clicked
 */
function splitCell(element){
    let nbColumnsToSplit = Math.round(element.colSpan / 2);
    if(element.colSpan > 1) {
        let row = element.parentElement;
        let columnIndex = element.cellIndex;
        let rowIndex = row.rowIndex + 1;
        let columnToSplitContent = row.parentElement.getElementsByTagName('tr')[rowIndex].getElementsByTagName('td')[columnIndex];
        let columnToInsertContent = columnToSplitContent.parentElement.insertCell(columnIndex + 1);
        let columnToModifyCell = row.insertCell(columnIndex + 1);

        columnToInsertContent.colSpan = element.colSpan - nbColumnsToSplit;
        columnToModifyCell.colSpan = element.colSpan - nbColumnsToSplit;
        element.colSpan = nbColumnsToSplit;
        columnToSplitContent.colSpan = nbColumnsToSplit;
        columnToInsertContent.classList.add("module");
        columnToModifyCell.classList.add("fuseCellsCell");
        columnToModifyCell.onmousedown = Function("modifyCell(this, event)");
        columnToModifyCell.onmouseover = Function("preview(this, 1, this.colSpan)");
        columnToModifyCell.onmouseout = Function("preview(this, 0, this.colSpan)");
        columnToInsertContent.innerHTML = "<textarea oninput='insertDelta(this)' onmousedown='boldText(this, 1)' onmouseup='boldText(this, 0)' ondblclick=\"switchColor(this)\" class='input blackNormal' name='input textareaClass' rows='7' cols='5' placeholder='Circuit ...'></textarea><br><textarea oninput='insertDelta(this)' onmousedown='boldText(this, 1)' onmouseup='boldText(this, 0)' ondblclick=\"switchColor(this)\" class='inputNumber blackNormal' name='input textareaClass' rows='1' cols='5' placeholder='N°'></textarea>";
        columnToModifyCell.oncontextmenu = function () {
            return false
        };

        document.getElementById('events').style.color = "#11809B";
        document.getElementById('events').innerHTML = "Cell split successfully";
    }
    else{
        document.getElementById('events').style.color = "red";
        document.getElementById('events').innerHTML = "Cannot split cell, the cell's size is already at its lowest";
        console.log("Erreur, impossible de diviser la colonne.\n La colonne est a déjà atteint sa taille minimum.\n (cfr. --> Function splitCell)");
    }

    preview(element, 1, nbColumnsToSplit);
}

/**
 * Function which is called on a double click of a textarea
 * It switches the color of the textarea to the color stored in the color variable
 * At the end the placeHolderClass() function is called
 *
 * @param element     HTML element which was clicked
 */
function switchColor(element){
    element.style.color = color;
    placholderClass(element);

    document.getElementById('events').style.color = "#11809B";
    document.getElementById('events').innerHTML = "Color has been switched";
    document.getElementById('saveStatus').innerHTML = "Unsaved";
    document.getElementById('saveStatus').style.color = "red";
}


/**
 * OTHER
 */

/**
 * Function which shows to the user which cells will be merged or split if he clicks on the element.
 * It does so by applying colors on the cells
 *
 * @param element {Element} element which was clicked
 * @param mouseOver {boolean} variable which will be true if the mouse went over the element and false if the mouse went off the element
 * @param colspan {number} colspan of the selected element
 */
function preview(element, mouseOver, colspan){
    let row = element.parentElement;
    let columnIndex = element.cellIndex;
    let rowIndex = row.rowIndex + 1;
    let textareaToSplit1 = row.parentElement.getElementsByTagName('tr')[rowIndex].getElementsByTagName('td')[columnIndex].getElementsByTagName('textarea')[0];
    let textareaToSplit2 = row.parentElement.getElementsByTagName('tr')[rowIndex].getElementsByTagName('td')[columnIndex].getElementsByTagName('textarea')[1];
    let columnToSplit = row.parentElement.getElementsByTagName('tr')[rowIndex].getElementsByTagName('td')[columnIndex];

    for (let i = 0; i < row.cells.length; i++) {
        row.parentElement.getElementsByTagName('tr')[rowIndex].getElementsByTagName('td')[i].style.backgroundColor = "white";
        row.parentElement.getElementsByTagName('tr')[rowIndex].getElementsByTagName('td')[i].getElementsByTagName('textarea')[0].style.backgroundColor = "white";

        if (row.parentElement.getElementsByTagName('tr')[rowIndex].getElementsByTagName('td')[i].getElementsByTagName('textarea')[1] !== undefined) {
            row.parentElement.getElementsByTagName('tr')[rowIndex].getElementsByTagName('td')[i].getElementsByTagName('textarea')[1].style.backgroundColor = "white";
        }
    }

    if(mouseOver){
        if(row.cells.length === columnIndex + 1){
            if(colspan <= 1){
                columnToSplit.style.backgroundColor = '#84DA81';
                textareaToSplit1.style.backgroundColor = '#84DA81';
                if (textareaToSplit2 !== undefined) {
                    textareaToSplit2.style.backgroundColor = '#84DA81';
                }
            }
            else{
                columnToSplit.style.backgroundColor = '#E67575';
                textareaToSplit1.style.backgroundColor = '#E67575';
                if (textareaToSplit2 !== undefined) {
                    textareaToSplit2.style.backgroundColor = '#E67575';
                }
            }
        }
        else {
            let textareaToFuse1 = row.parentElement.getElementsByTagName('tr')[rowIndex].getElementsByTagName('td')[columnIndex + 1].getElementsByTagName('textarea')[0];
            let textareaToFuse2 = row.parentElement.getElementsByTagName('tr')[rowIndex].getElementsByTagName('td')[columnIndex + 1].getElementsByTagName('textarea')[1];
            let columnToFuse = row.parentElement.getElementsByTagName('tr')[rowIndex].getElementsByTagName('td')[columnIndex + 1];

            if (colspan <= 1) {
                columnToSplit.style.backgroundColor = '#84DA81';
                textareaToSplit1.style.backgroundColor = '#84DA81';
                if (textareaToSplit2 !== undefined) {
                    textareaToSplit2.style.backgroundColor = '#84DA81'
                }
            }
            else {
                columnToSplit.style.backgroundColor = '#E67575';
                textareaToSplit1.style.backgroundColor = '#E67575';
                if (textareaToSplit2 !== undefined) {
                    textareaToSplit2.style.backgroundColor = '#E67575';
                }
            }

            columnToFuse.style.backgroundColor = '#84DA81';
            textareaToFuse1.style.backgroundColor = '#84DA81';
            if (textareaToFuse2 !== undefined) {
                textareaToFuse2.style.backgroundColor = '#84DA81';
            }

        }
    }
}

/**
 * Function which is executed on a long press of the left mouse button.
 * If the long press is executed the font-weight of the nearby textarea turns to bold
 *
 * @param element       clicked element
 * @param mouseDown     {boolean}   serves to see if the user released its mouse button
 * @returns {boolean}   if the timer isn't completed it blocks the function from ending
 */
function boldText(element, mouseDown){
    if(mouseDown){
        pressTimer = window.setTimeout(function () {
            if(element.style.fontWeight === "" || element.style.fontWeight === "normal") {
                element.style.fontWeight = "bold";
                placholderClass(element);
                document.getElementById('events').style.color = "#11809B";
                document.getElementById('events').innerHTML = "Font-weight successfully set to bold";
            }
            else{
                element.style.fontWeight = "normal";
                placholderClass(element);
                document.getElementById('events').style.color = "#11809B";
                document.getElementById('events').innerHTML = "Font-weight successfully set to normal";
            }
            document.getElementById('saveStatus').innerHTML = "Unsaved";
            document.getElementById('saveStatus').style.color = "red";
            }, 500);
        return false;
    }
    else{
        clearTimeout(pressTimer);
        return false;
    }
}

/**
 * Function which changes the color stored in the color variable
 *
 * @param newColor {string}     new color to store
 */
function changeColor(newColor){
    color = newColor;
    document.getElementsByTagName('fieldset')[0].style.borderColor = color;

    document.getElementById('events').style.color = "#080840";
    document.getElementById('events').innerHTML = "Color has been changed to " + color;
}

/**
 * Function which changes the placeholder of a textarea in order to change its color to the
 * same color as there will be once the user starts writing text in it.
 *
 * @param element       clicked element
 */
function placholderClass(element){
    if (element.style.fontWeight === "" || element.style.fontWeight === "normal"){
        if(element.style.color === "" || element.style.color === "black"){
            element.classList.replace(element.classList[1], 'blackNormal');
        }
        else if (element.style.color === "red"){
            element.classList.replace(element.classList[1], 'redNormal');
        }
        else if (element.style.color === "blue"){
            element.classList.replace(element.classList[1], 'blueNormal');
        }
        else if (element.style.color === "green"){
            element.classList.replace(element.classList[1], 'greenNormal');
        }
    }
    else{
        if(element.style.color === "" || element.style.color === "black"){
            element.classList.replace(element.classList[1], 'blackBold');
        }
        else if (element.style.color === "red"){
            element.classList.replace(element.classList[1], 'redBold');
        }
        else if (element.style.color === "blue"){
            element.classList.replace(element.classList[1], 'blueBold');
        }
        else if (element.style.color === "green"){
            element.classList.replace(element.classList[1], 'greenBold');
        }
    }
}

/**
 * Function which prints the project
 */
function printWindow() {
    if (activate) {
        window.print();
    }
    else{
        console.log('Veuillez créer un nouveau projet ou ouvrir un projet existant');
    }
}

/**
 * Function which turns every "delta " word entered in a textarea into a greek delta sign.
 *
 * This function is also used to see if a textarea element is overflowing
 *
 * @param text Textarea element where the user is writing
 */
function insertDelta(text){
    text.value = text.value.replace('delta ', '\u0394' + ' ');

    document.getElementById('saveStatus').style.color = "red";
    document.getElementById('saveStatus').innerHTML = "Unsaved";

    if (text.scrollHeight > text.offsetHeight) {
        text.parentElement.style.borderColor = "red";
    }
    else{
        text.parentElement.style.borderColor = "grey";
    }
}

/**
 * Function which sends the Project code and information to the server
 * It therefor creates a JSON string of the textarea values and sends all of it
 */
function saveProject(){
    if (activate) {
        let xhr = new XMLHttpRequest();
        let textarea = {};
        let count = 0;

        for (let j of document.getElementsByClassName('etiquette')) {
            for (let i of j.cells) {
                textarea[count] = [];
                textarea[count].push(i.getElementsByTagName('textarea')[0].value);

                if (i.getElementsByTagName('textarea')[1] !== undefined){
                    textarea[count].push(i.getElementsByTagName('textarea')[1].value);
                }
                count++;
            }
        }

        xhr.addEventListener("error", function () {
            document.getElementById('events').style.color = "red";
            document.getElementById('events').innerHTML = "Failed to save the project, please try again. If the problem keeps occurring please call Miguel Antoons 0477 81 98 63";
        });
        xhr.open("POST", '/serv_saveProject', true);
        xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");

        xhr.onreadystatechange = function () {
            if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
                document.getElementById('events').style.color = "#11809B";
                document.getElementById('events').innerHTML = "Project successfully saved";
                document.getElementById('saveStatus').style.color = "#119B18";
                document.getElementById('saveStatus').innerHTML = "Saved";
                console.log("it worked");
            }
            else {
                document.getElementById('events').style.color = "#11809B";
                document.getElementById('events').innerHTML = "Loading ...";
                console.log("processing...");
            }
        }

        xhr.send("clientId=" + clientID + "&projectName=" + document.getElementById('projectTitle').innerText + "&HTML=" + document.getElementById('etiquettes').innerHTML + "&textarea=" + JSON.stringify(textarea));
    }
    else{
        console.log('Veuillez créer un nouveau projet ou ouvrir un projet existant');
    }
}