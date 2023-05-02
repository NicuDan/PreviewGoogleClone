//Declare HTML elements
const takeNoteButton = document.querySelector('.take-note');
const create_note = document.querySelector('.create-note');
const close_note = document.querySelector('.close');
const container_note = document.querySelector('.container-note');
const getTitle = document.querySelector('#title_note');
const getDesc = document.querySelector('#desc_note');
const getImage = document.querySelector('.pickImage');
const getColor = document.querySelector('.changeColor');
const options = document.querySelector('.options');
const headerPage = document.querySelector('header');
const bodyPage = document.querySelector('body');
const search = document.querySelector('#search');
const textarea = document.querySelector('textarea');
const temp = document.querySelector('template');
const main = document.querySelector('main');

//Database
const getLink = 'http://localhost:3000/Data';

//Boolean
let checkDisplayCreateNote = true;
let checkEditMode = false;
let editColor = false;
let editImage = false;

//Dynamic HTML elements
let notes;
let options_note;
let delete_note;
let editNoteColor;

//Temporary note for editing purpose
let tempNote;
let colorNote;

//Var for editing parts of note
let noteDesc;
let noteTitle;

let Notes = [];
let imageEncoded = '';
let editImageEncoded = '';

//Display purpose
getDatafromDB();

//When takeNoteButton is pressed the create_note tab will either be shown or hidden
takeNoteButton.addEventListener('click', () => {
  if (checkDisplayCreateNote === true) {
    create_note.style.display = 'none';
    checkDisplayCreateNote = false;
  } else {
    create_note.style.display = 'flex';
    checkDisplayCreateNote = true;
    //Default state of create_note
    getTitle.style.display = 'none';
    options.style.display = 'none';
  }
});

//Expand create_note container on click
getDesc.addEventListener('click', () => {
  getTitle.style.display = 'flex';
  options.style.display = 'flex';
});

//If the textarea have more than 128 characters then it creates a red shadowbox
getDesc.addEventListener('keyup', () => {
  if (getDesc.textLength == 128) {
    getDesc.style.boxShadow = '0px 0px 5px 2px #FF0000';
  } else {
    getDesc.style.boxShadow = 'none';
  }
});

//Close create_note with the close_note button
close_note.addEventListener('click', () => {
  create_note.style.display = 'none';
  checkDisplayCreateNote = false;
});

//Show input to link an image
getImage.addEventListener('change', function () {
  const reader = new FileReader();
  reader.addEventListener('load', () => {
    imageEncoded = reader.result;
  });
  reader.readAsDataURL(this.files[0]);
});

//Create an div from database
function addDiv(title, description, color, image) {
  notes = document.createElement('div');
  notes.classList.add('notes');
  notes.style.backgroundColor = color;
  let titleOfNote = document.createElement('h1');
  titleOfNote.classList.add('title');
  titleOfNote.innerHTML = title;
  let descriptionOfNotes = document.createElement('p');
  descriptionOfNotes.classList.add('desc');
  descriptionOfNotes.innerHTML = description;
  let photo = document.createElement('div');
  if (image != '') {
    photo.classList.add('image');
  }
  photo.style.backgroundImage = `url(${image})`;

  //We verify if the note is black and put a white text so it can be read
  if (color == '#000000') {
    titleOfNote.style.color = '#ffffff';
    descriptionOfNotes.style.color = '#ffffff';
  }

  //Create an options tab
  options_note = document.createElement('div');
  options_note.classList.add('options_note');
  editNoteColor = document.createElement('div');
  editNoteColor.classList.add('editColorNote');
  editNoteColor.innerHTML =
    '<label><i class="fa fa-paint-brush fa-lg" aria-hidden="true"></i><input type="color" class="changeColorNote" /></label>';
  options_note.appendChild(editNoteColor);
  editNoteImage = document.createElement('div');
  editNoteImage.classList.add('editImageNote');
  editNoteImage.innerHTML =
    '<label><i class="fa fa-picture-o fa-lg" aria-hidden="true"></i><input type="file" accept="image/*" class="changeImageNote" /></label>';
  options_note.appendChild(editNoteImage);
  delete_note = document.createElement('div');
  delete_note.classList.add('delete');
  delete_note.innerHTML =
    '<label><i class="fa fa-trash fa-lg" aria-hidden="true"></i><label>';
  options_note.appendChild(delete_note);
  options_note.style.display = 'none';
  titleOfNote.contentEditable = 'false';
  descriptionOfNotes.contentEditable = 'false';
  notes.append(titleOfNote, descriptionOfNotes, photo, options_note);
  container_note.appendChild(notes);
  return notes, options_note;
}

//Get the items from database
function getDatafromDB() {
  fetch(getLink)
    .then((data) => {
      return data.json();
    })
    .then((objectData) => {
      Notes = objectData.map((values) => {
        addDiv(
          `${values.title}`,
          `${values.description}`,
          `${values.color}`,
          `${values.image}`
        );
        return {
          id: values.id,
          title: values.title,
          description: values.description,
          color: values.color,
          image: values.image,
          container: notes,
          options: options_note,
          edit_color: editNoteColor,
          delete: delete_note,
        };
      });
    });
}

//Seach for element
search.addEventListener('input', (searchtext) => {
  const value = searchtext.target.value.toLowerCase();
  Notes.forEach((note) => {
    if (
      note.title.toLowerCase().includes(value) ||
      note.description.toLowerCase().includes(value)
    ) {
      note.container.style.display = 'flex';
    } else {
      note.container.style.display = 'none';
    }
  });
});

//Add a new note when the user clicks outside the containter and have a title
document.addEventListener('click', (containter) => {
  if (
    containter.target.closest('.create-note') ||
    containter.target.closest('.notes') ||
    containter.target.closest('header')
  ) {
    return;
  }
  //After the note was created the create_note will became smaller again
  getTitle.style.display = 'none';
  options.style.display = 'none';

  //If the user has not entered any title the data will not be created in db
  if (getTitle.value != '') {
    //Get information from container
    const payload = {
      title: getTitle.value,
      description: getDesc.value,
      image: imageEncoded,
      color: getColor.value,
    };

    //Create a new element into the db
    const getData = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    };
    fetch(getLink, getData).then(() => {
      location.reload();

      //We clear the values from create_note container
      getTitle.value = '';
      getDesc.value = '';
    });
  }
});

setTimeout(function editMode() {
  Notes.forEach((note) => {
    //Enable "edit mode"
    note.container.addEventListener('click', () => {
      if (checkEditMode === false) {
        checkEditMode = true;
        tempNote = note;
        inEditMode(note);
        note.edit_color.addEventListener('click', () => {
          editColor = true;
        });
      }
    });
    //Disable "edit mode"
    temp.addEventListener('click', () => {
      checkEditMode = false;
      outEditMode(note);
    });
  });
  //Patch
  temp.addEventListener('click', () => {
    //For Image
    if (editImage === true) {
      fetch(getLink + `/${tempNote.id}`, {
        method: 'PATCH',
        headers: {
          'Content-type': 'application/json',
        },
        body: JSON.stringify({
          image: editImageEncoded,
        }),
      }).then(location.reload());
      editImage = false;
    }
    //For color
    let changeColor = tempNote.container.querySelector('.changeColorNote');
    if (editColor === true) {
      fetch(getLink + `/${tempNote.id}`, {
        method: 'PATCH',
        headers: {
          'Content-type': 'application/json',
        },
        body: JSON.stringify({
          color: changeColor.value,
        }),
      }).then(location.reload());
      editColor = false;
    }
    //For text
    fetch(getLink + `/${tempNote.id}`, {
      method: 'PATCH',
      headers: {
        'Content-type': 'application/json',
      },
      body: JSON.stringify({
        title: noteTitle.innerHTML,
        description: noteDesc.innerHTML,
      }),
    });
  });
}, 2000);

function inEditMode(note) {
  let imageEdit = tempNote.container.querySelector('.changeImageNote');
  imageEdit.addEventListener('change', function () {
    const reader = new FileReader();
    reader.addEventListener('load', () => {
      editImageEncoded = reader.result;
      editImage = true;
    });
    reader.readAsDataURL(this.files[0]);
  });
  //Local var
  noteTitle = note.container.querySelector('.title');
  noteDesc = note.container.querySelector('.desc');
  //Enable editable parts in note
  noteTitle.contentEditable = 'true';
  noteDesc.contentEditable = 'true';

  //Template for edit mode
  (main || header).style.pointerEvents = 'none';
  (main || header).style.filter = 'blur(5px)';
  temp.classList.add('active');
  note.options.style.display = 'flex';
  note.container.classList.add('active');
  //If the containter is black the options will be in white
  if (note.color == '#000000') {
    delete_note.style.color = '#ffffff';
  }

  bodyPage.append(note.container);
  //Delete the note
  note.delete.addEventListener('click', () => {
    fetch(getLink + `/${note.id}`, { method: 'DELETE' }).then(() => {
      location.reload();
    });
  });
}
function outEditMode(note) {
  (main || header).style.pointerEvents = 'all';
  (main || header).style.filter = 'none';
  temp.classList.remove('active');
  note.options.style.display = 'none';
  note.container.classList.remove('active');
  container_note.append(note.container);
}
