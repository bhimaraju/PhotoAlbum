var lat, lng, address;

$('body').on("click", ".glyphicon-edit", function () {
    //console.log("Click!", $(this).attr("header-id"));

    var nameHeader = $(this).siblings(":header[header-id]");
    var locationHeader = $(this).siblings(":header[name='location']");
    var id = nameHeader.attr("header-id");
    nameHeader.hide();
    locationHeader.hide();
    $(this).hide();
    var form = $(this).siblings("form[name='picture']");
    form.attr("name-form-id", id);
    form.children("#text-field").attr("value", nameHeader.text());
    form.children("#text-location").attr("value", locationHeader.text());
    form.show();
    form.on("submit", function () {
        console.log("Submit!");
        var pic = {
            Id: id,
            Location: form.children("#text-location").val(),
            Name: form.children("#text-field").val()
        }

        submitNameForm(pic);
        return false;
    });
});

$('body').on("click", ".glyphicon-floppy-remove", function () {
    //console.log("Click!", $(this).attr("header-id"));

    var nameHeader = $(this).siblings(":header[header-id]");
    var id = nameHeader.attr("header-id");
    var r = confirm("Are you sure you want to delete this picture?");
    if (r == true) {
        deletePicture(id);
    } else {
        return false;
    }

});

function deletePicture(id) {
    var pic = { Id: id };
    $.ajax({
        url: '/Home/DeletePicture',
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(pic)
    }).done(function () {
        $(".close").click();
        albumId = $("li[isselected='true']").attr('album-row');
        var album = { Id: albumId };
        loadAlbum(album);
    })
}

function submitNameForm(pic) {
    console.log("The new name is, ", pic.Name);

    $.ajax({
        url: '/Home/EditPicture',
        contentType: 'application/json',
        method: 'post',
        data: JSON.stringify(pic)
    }).done(function () {
        var form = $('form[name-form-id="' + pic.Id + '"]').hide();
        var nameHeader = form.siblings(":header[name='name']");
        var locationHeader = form.siblings(":header[name='location']")
        nameHeader.text(pic.Name);
        locationHeader.text(pic.Location);
        //console.log("Header text is ", header.text());
        nameHeader.show();
        locationHeader.show();
        nameHeader.siblings(".glyphicon-edit").show();
        return false;
    }).error(function (error) {
        console.log(error);
    });
}

$(document).ready(function () {
    $.ajax({
        url: '/Home/Albums',
        dataType: 'json',
        method: 'GET'
    }).done(function (albums) {
        console.log(albums);
        $.each(albums, function (idx, album) {
            var html = loadAlbumItem(album);
            $("#albumList").append(html);
        });
    }).error(function (error) {
        console.log(error);
    });
});


$("#addAlbumForm").on("submit", function () {
    addAlbum($("#albumName").val());
    $("#albumName").val("");
    return false;
});

function addAlbum(name) {
    if (name == null) {
        return false;
    }

    var album = { Name: name };
    $.ajax({
        url: '/Home/AddAlbum',
        dataType: 'json',
        contentType: 'application/json',
        method: 'POST',
        data: JSON.stringify(album)
    }).done(function (data) {
        console.log(data);
        var html = loadAlbumItem(data);
        console.log(html);
        $("#albumList").append(html);
    }).error(function (error) {
        console.log(error);
    });
}

function loadAlbumItem(album) {
    var nameHtml = '<a class="btn btn-success" style="width:48%;margin:1%;overflow:hidden" href=# album-id="' + album.Id + '">' + album.Name + '</a>';
    var editHtml = '<a class="btn btn-default" style="width:23%;margin:1%;overflow:hidden" href=# edit-id = "' + album.Id + '">Edit</a>';
    var delHtml = '<a class="btn btn-danger" style="width:23%;margin:1%;overflow:hidden" href=# delete-id = "' + album.Id + '">Delete</a>';
    var html = '<li style="width:99%;margin:2px;border-radius:2px" album-row="' + album.Id + '">' + nameHtml + editHtml + delHtml + '</li>';

    return html;
}

function upload(albumId) {
    var pic = {
        AlbumId: albumId,
        Location: address
    };

    console.log("The pic to be added is", pic);
    $('.progress').show();

    $('#fileupload').fileupload({
        formData: pic,
        dataType: 'json',
        url: '/Home/AddPictures',
        autoUpload: true,
        done: function (e, data) {
            var picList = data.result;
            console.log(picList);
            $.each(picList, function (idx, picture) {
                console.log(picture);
                loadPic(picture);
            });
            $('.progress').hide();
        }
    }).on('fileuploadprogressall', function (e, data) {

        var progress = parseInt(data.loaded / data.total * 100, 10);
        $('.progress .progress-bar').css('width', progress + '%');
    });

}

$("#albumList").on("click", "a[album-id]", function () {
    console.log("Click from: " + $(this).text());

    var id = $(this).attr("album-id");
    var album = {
        Id: id,
        Name: $(this).text()
    }
    console.log("Loading the album: ", album)
    loadAlbum(album);

});

$("#albumList").on("click", "a[delete-id]", function () {
    var id = $(this).attr("delete-id");
    var r = confirm("Are you sure you want to delete this album?");
    if (r == true) {
        console.log("Deleting album with id: " + id);
        var album = { Id: id };
        $.ajax({
            url: '/Home/DeleteAlbum',
            contentType: 'application/json',
            method: 'POST',
            data: JSON.stringify(album)
        }).done(function () {
            $("#albumList").find('li[album-row="' + album.Id + '"]').remove();

            if ($("div[album-contents-id]").attr("album-contents-id") == album.Id) {
                $("#albumHeading").text("");
                $("#links").html("");
                $("#uploadPicForm").hide();
                $("#albumList:first-child").children("a[album-id]").click();
            }
        }).error(function (er) {
            console.log(er);
        });
    } else {
        return false;
    }
});

$("#albumList").on("click", "a[edit-id]", function () {
    console.log("Click from: " + $(this).text());
    var id = $(this).attr("edit-id");

    var row = $("li[album-row=" + id + "]");
    var details = row.children();

    details.hide();
    var form;
    if (!row.find("form").length) {
        console.log("Appending Form to Row");
        var textInput = '<input class="form-control" name="albumName" type="text" style="width:45%;margin:2px;"/>';
        var submitInput = '<input style="width:25%;margin:2px;" type="submit" class="btn btn-primary" value="Submit" />';
        var cancelInput = '<input type="button" class="btn btn-default" value="Cancel" style="width:25%;margin:2px;"/>';
        form = '<form class="form-inline" edit-album-form-id="' + id + '" name="editAlbumForm">' + textInput + submitInput + cancelInput + '</form>';
        row.prepend(form);
    }

    form = row.children("form");
    EditAlbumEventHandlers();
    var existingAlbumName = row.find("a[album-id]").text();
    form.children("input[name='albumName']").val(existingAlbumName);
    form.show();

});

function EditAlbumEventHandlers() {

    $("form[edit-album-form-id]").on("click", "input[type='button']", function () {
        $(this).parent().hide();
        $(this).parent().siblings().show();
    });

    $("form[edit-album-form-id]").submit(function () {
        var form = $(this);

        var newAlbumName = form.children("input[name='albumName']").val();

        var request = {
            Id: form.attr("edit-album-form-id"),
            Name: newAlbumName
        }
        console.log("The edited album is ", request);

        $.ajax({
            url: '/Home/EditAlbumName',
            contentType: 'application/json',
            data: JSON.stringify(request),
            method: 'POST'
        }).done(function () {
            console.log("Name Edit Succesful");
            form.hide();
            form.siblings("a[album-id]").text(request.Name);
            form.siblings().show();

            if ($("div[album-contents-id]").attr("album-contents-id") == request.Id) {
                $("#albumHeading").text(request.Name);
            }

        }).error(function (error) {
            console.log(error);
        });
        return false;
    });
}

$("#fileupload").on("click", function () {
    console.log("Click from: " + $(this).text())
    var albumId = $("#fileupload").attr("upload-id");

    console.log(albumId);
    upload(albumId);
});

function loadPic(pic) {
    var imgData = "data:image/jpeg;base64," + pic.Content;
    var html = '<a id="' + pic.Id + '" href="' + imgData + '" title="' + pic.Name + '" name="' + pic.Location + '" data-gallery>' + '<img height=100 width = auto src="' + imgData + '" alt="' + pic.Name + '"></a>';
    $("#links").append(html);
}

function loadAlbum(album) {
    $("#uploadPicForm input").attr("upload-id", album.Id);
    $("#uploadPicForm").show();
    $.ajax({
        url: '/Home/AlbumContents',
        dataType: 'json',
        contentType: 'application/json',
        data: album,
        method: 'GET'
    }).done(function (pictures) {
        console.log(pictures);
        $("#links").html("");
        $("#albumHeading").text(album.Name);
        if (pictures != null) {
            $.each(pictures, function (idx, picture) {
                loadPic(picture);
            });
        }
        var id = album.Id;
        $("uploadPicForm").show();
        $("#addPic a").show();
        $("div[album-contents-id]").attr("album-contents-id", id);
        $("li[album-row]").css("background-color", "transparent");
        $("li[album-row='" + id + "']").css("background-color", "white");
        $("li[album-row]").attr("isSelected", "false");
        $("li[album-row='" + id + "']").attr("isSelected", "true");
    }).error(function (error) {
        console.log(error);
    });
}

function picNameEditForm(element) {
    element.hide();
    var html = '<div id="editPicName" hidden> <input pic-id="' + + '" type="text" ><a class="btn btn-primary">Submit</a></div>'

}

function loadPicNameEditForm(element) {
    console.log("Pic Name FOrm was here");
    var id = element.attr("id");
    console.log(element);
    $(element).hide();
    $(element.siblings("form")).attr("id", id);
    $(element.siblings("form")).show();
}

$("form[name-form-id]").submit(function () {

    var name = $(this).children("#field").val();
    var id = $(this).children("#field").attr("id");
    var pic = {
        Id: id,
        Name: name
    };

    $.ajax({
        url: '/Home/EditPicture',
        dataType: 'json',
        data: pic,
        method: 'POST'
    }).done(function () {
        $(this.hide());
        $(element.siblings("form")).text(name);
        $(element.siblings("h")).show();

    }).error(function (error) {
        console.log(error);
    });
});

function editPic(element) {
    console.log("Pic Name Form will be here");
    console.log(element);
    loadPicNameEditForm(element);
}

function getAddressFromCoord() {
    $.ajax({
        url: 'https://maps.googleapis.com/maps/api/geocode/json?latlng=' + lat + ',' + lng + '&key=AIzaSyB891RJkcBBodk-aiQoXo0wjWLzOY06WU0&result_type=administrative_area_level_2',
        dataType: 'json',
        method: 'get'
    }).done(function (data) {
        address = data.results[0].formatted_address;
    }).error(function (er) {
        console.log(er);
    });
}

var options = {
    enableHighAccuracy: true,
    timeout: 5000,
    maximumAge: 0
};

function success(pos) {
    var crd = pos.coords;
    console.log('Your current position is:');
    console.log('Latitude : ' + crd.latitude);
    console.log('Longitude: ' + crd.longitude);
    console.log('More or less ' + crd.accuracy + ' meters.');
    lat = crd.latitude;
    lng = crd.longitude;
    getAddressFromCoord();
};

function error(err) {
    console.warn('ERROR(' + err.code + '): ' + err.message);
};

if (Modernizr.geolocation) {
    navigator.geolocation.getCurrentPosition(success, error, options);
} else {
    alert("Your Browser Does Not Support Geolocation");
}