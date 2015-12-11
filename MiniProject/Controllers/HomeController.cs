using MiniProject.Models;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Data.SqlClient;
using System.IO;
using System.Linq;
using System.Net;
using System.Web;
using System.Web.Mvc;
using System.Web.Script.Serialization;

namespace MiniProject.Controllers
{
    public class HomeController : Controller
    {
        PictureAlbumDbContext db = new PictureAlbumDbContext();

        public ActionResult Index()
        {
            return View();
        }

        [HttpPost]
        public ActionResult DeletePicture(Picture pic)
        {
            if (pic.Id >= 0)
            {
                var picture = db.Pictures.FirstOrDefault(x => x.Id == pic.Id);
                db.Pictures.Remove(picture);
                db.SaveChanges();
                return new HttpStatusCodeResult(HttpStatusCode.OK);
            }
            return new HttpStatusCodeResult(HttpStatusCode.BadRequest, "Invalid Id");
        }

        [HttpPost]
        public ActionResult EditPicture(Picture pic)
        {
            if (pic.Id > 0 && !string.IsNullOrWhiteSpace(pic.Name))
            {
                int id = pic.Id;
                string name = pic.Name;
                string location = pic.Location;
                db.Pictures.First(x => x.Id == id).Name = name;
                db.Pictures.First(x => x.Id == id).Location = location;
                db.SaveChanges();
                return new HttpStatusCodeResult(HttpStatusCode.OK);
            }
            else
            {
                return new HttpStatusCodeResult(HttpStatusCode.BadRequest, "Please verify the Id and Name");
            }
        }

        [HttpGet]
        public ActionResult Albums()
        {
            var albumList = db.Albums.ToList();
            return Content(JsonConvert.SerializeObject(albumList, new JsonSerializerSettings
            {
                ReferenceLoopHandling = ReferenceLoopHandling.Ignore
            }), "application/json");
        }

        [HttpPost]
        public ActionResult DeleteAlbum(Album request)
        {
            if (request.Id > 0)
            {
                Album album = db.Albums.FirstOrDefault(x => x.Id == request.Id);
                db.Albums.Remove(album);
                db.SaveChanges();
                return new HttpStatusCodeResult(HttpStatusCode.OK);
            }
            else
            {
                return new HttpStatusCodeResult(HttpStatusCode.BadRequest, "The Id is invalid");
            }
        }

        [HttpPost]
        public ActionResult EditAlbumName(Album album)
        {
            if (album.Id > 0 && !string.IsNullOrWhiteSpace(album.Name))
            {
                int id = album.Id;
                string newName = album.Name;

                db.Albums.FirstOrDefault(x => x.Id == id).Name = newName;
                db.SaveChanges();

                return new HttpStatusCodeResult(HttpStatusCode.OK);
            }
            else
            {
                return new HttpStatusCodeResult(HttpStatusCode.BadRequest, "Please verify the Id and Name");
            }
        }

        [HttpGet]
        public ActionResult AlbumContents(Album album)
        {
            if (album.Id > 0)
            {
                return Content(JsonConvert.SerializeObject(db.Albums.First(x => x.Id == album.Id).Pictures, new JsonSerializerSettings
                {
                    ReferenceLoopHandling = ReferenceLoopHandling.Ignore
                }), "application/json");
            }
            else
            {
                return new HttpStatusCodeResult(HttpStatusCode.BadRequest, "Please verify the Id and try again");
            }
        }

        [HttpPost]
        public ActionResult AddAlbum(Album request)
        {
            if (request.Name != null)
            {
                Album album = new Album();
                album.Name = request.Name;
                album = db.Albums.Add(album);
                db.SaveChanges();
                var id = album.Id;
                var result = db.Albums.First(x => x.Id == id);
                return Content(JsonConvert.SerializeObject(result, new JsonSerializerSettings
                {
                    ReferenceLoopHandling = ReferenceLoopHandling.Ignore
                }), "application/json");
            }
            return new HttpStatusCodeResult(HttpStatusCode.BadRequest, "Album has no name");
        }

        [HttpPost]
        public ActionResult AddPictures(Picture picture)
        {
            var picList = new List<Picture>();
            int i = 0;
            foreach (string file in Request.Files)
            {
                HttpPostedFileBase upload = Request.Files[file] as HttpPostedFileBase;

                if (upload == null || upload.ContentLength == 0) return new HttpStatusCodeResult(HttpStatusCode.BadRequest);

                if (upload != null && upload.ContentLength > 0)
                {
                    try
                    {
                        var pic = new Picture
                        {
                            Name = System.IO.Path.GetFileName(upload.FileName),
                            ContentType = upload.ContentType
                        };
                        using (var reader = new System.IO.BinaryReader(upload.InputStream))
                        {
                            pic.Content = reader.ReadBytes(upload.ContentLength);
                        }

                        pic.ContentLength = upload.ContentLength;

                        var album = db.Albums.Find(picture.AlbumId);
                        pic.Album = album;
                        pic.Location = picture.Location;
                        db.Pictures.Add(pic);
                        album.Pictures.Add(pic);
                        db.SaveChanges();
                        picList.Add(pic);
                    }
                    catch (IOException e)
                    {
                        return new HttpStatusCodeResult(HttpStatusCode.BadRequest, e.InnerException.Message);
                    }
                    catch (SqlException e)
                    {
                        return new HttpStatusCodeResult(HttpStatusCode.InternalServerError, e.InnerException.Message);
                    }
                }
                i++;
            }
            return Content(JsonConvert.SerializeObject(picList, new JsonSerializerSettings
            {
                ReferenceLoopHandling = ReferenceLoopHandling.Ignore
            }), "application/json");
        }
    }
}