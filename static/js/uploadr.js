/******************************************************************************
 * HTML5 Multiple File Uploader Demo                                          *
 ******************************************************************************/

// Constants
var MAX_UPLOAD_FILE_SIZE = 25*1024*1024; // 1 MB
var UPLOAD_URL = "/upload";
var NEXT_URL   = "/files/";

// List of pending files to handle when the Upload button is finally clicked.
var PENDING_FILES  = [];

function stringify(obj)
{
    var temp;
    temp = JSON.flatten(obj);
    // console.log(temp);
    var string = "";
    for (var ke in temp) {
           if (temp.hasOwnProperty(ke)) {
                // console.log(temp[ke])
                string += temp[ke];
           }
    } 
    return string;
}

function grabnextphrase(string,n,skip)
{
    var left = -1;
    var right = 0;
    while(true){
        if(string[n + right] == " " && left == -1){
            left = right;
            right++;
        }
        else if(string[n + right] == " " && left != -1)
            break;
        else
            right++;
    }
    var returnString = string.substring(n + left, n + right);
    if(returnString.length >= skip)
        return returnString;
    else{
        return returnString + grabnextphrase(string,n + right,skip);
    }
}

$('.form').find('input, textarea').on('keyup blur focus', function (e) {
  
  var $this = $(this),
      label = $this.prev('label');

      if (e.type === 'keyup') {
            if ($this.val() === '') {
          label.removeClass('active highlight');
        } else {
          label.addClass('active highlight');
        }
    } else if (e.type === 'blur') {
        if( $this.val() === '' ) {
            label.removeClass('active highlight'); 
            } else {
            label.removeClass('highlight');   
            }   
    } else if (e.type === 'focus') {
      
      if( $this.val() === '' ) {
            label.removeClass('highlight'); 
            } 
      else if( $this.val() !== '' ) {
            label.addClass('highlight');
            }
    }

});

function populate(data) {
    var string;
    //phone
    try{
        if(data.basics.phone){
            document.getElementById('inputPhone').value = data.basics.phone;
            label = $('#inputPhone').prev('label');
            label.addClass('active highlight');
        }
    }
    catch(err){console.log(err);}
    //address
    try{
        if(data.basics.address){
            document.getElementById('inputAddress').value = data.basics.address;
            label = $('#inputAddress').prev('label');
            label.addClass('active highlight');
        }
    }
    catch(err){console.log(err);}
    // website
    try{
        if(data.basics.url){
            // string = JSON.flatten(data.basics.url);
            // console.log(stringify(data.basics.url));
            document.getElementById('inputUrl').value = stringify(data.basics.url);
            label = $('#inputUrl').prev('label');
            label.addClass('active highlight');
        }
    }
    catch(err){console.log(err);}
    //////////////////////////////////////////////////////////////////
    //Education
    try{
        if(data.education_and_training){
            // string = JSON.flatten(data.skills);
            // console.log(stringify(data.education_and_training));
            string = stringify(data.education_and_training);
            lstring = string.toLowerCase();
            var n;

            if(lstring.search("gpa")){
                n = lstring.search("gpa");
                document.getElementById('inputGPA').value = grabnextphrase(string,n,-1);
                label = $('#inputGPA').prev('label');
                label.addClass('active highlight');
            }

            if(lstring.search("university")){
                n = lstring.search("university");
        
                document.getElementById('inputInstitution').value = "University" + grabnextphrase(string,n,4);
                label = $('#inputInstitution').prev('label');
                label.addClass('active highlight');
            }

            if(lstring.search("expected")){
                n = lstring.search("expected");
                console.log(n);
                document.getElementById('inputGrad').value = grabnextphrase(string,n,-1);;
                label = $('#inputGrad').prev('label');
                label.addClass('active highlight');
            }

            if(lstring.search("major")){
                n = lstring.search("major");
                console.log(n);
                document.getElementById('inputMajor').value = grabnextphrase(string,n,-1);;
                label = $('#inputMajor').prev('label');
                label.addClass('active highlight');
            }
        }
    }
    catch(err){console.log(err);}
    /////////////////////////////////////////////////////////////////////////////////
    //skills
    try{
        if(data.skills){
            // string = JSON.flatten(data.skills);
            console.log(stringify(data.skills))
            document.getElementById('inputSkills').value = stringify(data.skills);
        }
    }
    catch(err){console.log(err);}
    /////////////////////////////////////////////////////////////////////////////////
    // Work Experience
    try{
        if(data.work_experience){
            // string = JSON.flatten(data.skills);
            console.log(stringify(data.skills))
            document.getElementById('inputWE1DESCRIPTION').value = stringify(data.work_experience);
        }
    }
    catch(err){console.log(err);}

}

$(document).ready(function() {
    // Set up the drag/drop zone.
    $('#phase2').hide();
    $('#loader').hide();
    initDropbox();
    // Set up the handler for the file input box.
    $("#file-picker").on("change", function() {
        handleFiles(this.files);
    });

    // Handle the submit button.
    $("#upload-button").on("click", function(e) {
        // If the user has JS disabled, none of this code is running but the
        // file multi-upload input box should still work. In this case they'll
        // just POST to the upload endpoint directly. However, with JS we'll do
        // the POST using ajax and then redirect them ourself when done.
        e.preventDefault();
        $('#loader').show();
        doUpload();
    })
    $("#done-button").on("click", function(e) {
        e.preventDefault();
        window.location="/done";
    })
});


function doUpload() {
    $("#progress").show();
    var $progressBar   = $("#progress-bar");

    // Gray out the form.
    // $("#upload-form :input").attr("disabled", "disabled");

    // Initialize the progress bar.
    $progressBar.css({"width": "0%"});

    // Collect the form data.
    fd = collectFormData();

    // Attach the files.
    for (var i = 0, ie = PENDING_FILES.length; i < ie; i++) {
        // Collect the other form data.
        fd.append("file", PENDING_FILES[i]);
    }

    // Inform the back-end that we're doing this over ajax.
    fd.append("__ajax", "true");

    var xhr = $.ajax({
        xhr: function() {
            var xhrobj = $.ajaxSettings.xhr();
            if (xhrobj.upload) {
                xhrobj.upload.addEventListener("progress", function(event) {
                    var percent = 0;
                    var position = event.loaded || event.position;
                    var total    = event.total;
                    if (event.lengthComputable) {
                        percent = Math.ceil(position / total * 100);
                    }

                    // Set the progress bar.
                    $progressBar.css({"width": percent + "%"});
                    $progressBar.text(percent + "%");
                }, false)
            }
            return xhrobj;
        },
        url: UPLOAD_URL,
        method: "POST",
        contentType: false,
        processData: false,
        cache: false,
        data: fd,
        success: function(data) {
            $progressBar.css({"width": "100%"});
            data = JSON.parse(data);
            if (data.status === "error") {
                console.log("Hello");
                window.alert(data.msg);
                $("#upload-form :input").removeAttr("disabled");
                $('#loader').hide();
                return;
            }
            else {
                console.log("David");
                window.alert(data.msg);
                $('#loader').hide();
                return
            }
        },
        error: function(e) {
            console.log(e);
        }
    });
}


function collectFormData() {
    // Go through all the form fields and collect their names/values.
    var fd = new FormData();

    $("#upload-form :input").each(function() {
        var $this = $(this);
        var name  = $this.attr("name");
        var type  = $this.attr("type") || "";
        var value = $this.val();

        // No name = no care.
        if (name === undefined) {
            return;
        }

        // Skip the file upload box for now.
        if (type === "file") {
            return;
        }

        // Checkboxes? Only add their value if they're checked.
        if (type === "checkbox" || type === "radio") {
            if (!$this.is(":checked")) {
                return;
            }
        }

        fd.append(name, value);
    });

    return fd;
}


function handleFiles(files) {
    // Add them to the pending files list.
    for (var i = 0, ie = files.length; i < ie; i++) {
        PENDING_FILES.push(files[i]);
    }
}


function initDropbox() {
    var $dropbox = $("#dropbox");

    // On drag enter...
    $dropbox.on("dragenter", function(e) {
        e.stopPropagation();
        e.preventDefault();
        $(this).addClass("active");
    });

    // On drag over...
    $dropbox.on("dragover", function(e) {
        e.stopPropagation();
        e.preventDefault();
    });

    // On drop...
    $dropbox.on("drop", function(e) {
        e.preventDefault();
        $(this).removeClass("active");

        // Get the files.
        var files = e.originalEvent.dataTransfer.files;
        handleFiles(files);

        // Update the display to acknowledge the number of pending files.
        $dropbox.text(PENDING_FILES.length + " files ready for upload!");
    });

    // If the files are dropped outside of the drop zone, the browser will
    // redirect to show the files in the window. To avoid that we can prevent
    // the 'drop' event on the document.
    function stopDefault(e) {
        e.stopPropagation();
        e.preventDefault();
    }
    $(document).on("dragenter", stopDefault);
    $(document).on("dragover", stopDefault);
    $(document).on("drop", stopDefault);
}






// $('.tab a').on('click', function (e) {
  
//   e.preventDefault();
  
//   $(this).parent().addClass('active');
//   $(this).parent().siblings().removeClass('active');
  
//   target = $(this).attr('href');

//   $('.tab-content > div').not(target).hide();
  
//   $(target).fadeIn(600);
  
// });

JSON.flatten = function(data) {
    var result = {};
    function recurse (cur, prop) {
        if (Object(cur) !== cur) {
            result[prop] = cur;
        } else if (Array.isArray(cur)) {
             for(var i=0, l=cur.length; i<l; i++)
                 recurse(cur[i], prop ? prop+"."+i : ""+i);
            if (l == 0)
                result[prop] = [];
        } else {
            var isEmpty = true;
            for (var p in cur) {
                isEmpty = false;
                recurse(cur[p], prop ? prop+"."+p : p);
            }
            if (isEmpty)
                result[prop] = {};
        }
    }
    recurse(data, "");
    return result;
}


/* When the user clicks on the button,
toggle between hiding and showing the dropdown content */
function myFunction() {
    document.getElementById("myDropdown").classList.toggle("show");
}

// Close the dropdown menu if the user clicks outside of it
window.onclick = function(event) {
  if (!event.target.matches('.dropbtn')) {

    var dropdowns = document.getElementsByClassName("dropdown-content");
    var i;
    for (i = 0; i < dropdowns.length; i++) {
      var openDropdown = dropdowns[i];
      if (openDropdown.classList.contains('show')) {
        openDropdown.classList.remove('show');
      }
    }
  }
}
