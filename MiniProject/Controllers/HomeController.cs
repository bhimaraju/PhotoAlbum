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
        public ActionResult EditPictureName(Picture pic)
        {
            int id = pic.Id;
            string name = pic.Name;
            db.Pictures.First(x => x.Id==id).Name = name;
            db.SaveChanges();
            return new HttpStatusCodeResult(HttpStatusCode.OK);
        }

        [HttpGet]
        public ActionResult Albums()
        {
            var albumList = db.Albums.ToList();
            return Content(JsonConvert.SerializeObject(albumList), "application/json");
        }

        [HttpPost]
        public ActionResult DeleteAlbum(Album request)
        {
            Album album = db.Albums.FirstOrDefault(x => x.Id == request.Id);
            db.Albums.Remove(album);
            db.SaveChanges();
            return new HttpStatusCodeResult(HttpStatusCode.OK);
        }

        [HttpPost]
        public ActionResult EditAlbumName(Album album)
        {
            int id = album.Id;
            string newName = album.Name;

            db.Albums.FirstOrDefault(x => x.Id == id).Name = newName;
            db.SaveChanges();

            return new HttpStatusCodeResult(HttpStatusCode.OK);
        }

        [HttpGet]
        public ActionResult AlbumContents(Album album)
        {
            return Content(JsonConvert.SerializeObject(db.Albums.First(x => x.Id == album.Id).Pictures), "application/json");
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
                var result = db.Albums.First(x=>x.Id==id);
                return Json(result);
            }
            return new HttpStatusCodeResult(HttpStatusCode.BadRequest, "Album has no name");
        }

        [HttpPost]
        public ActionResult AddPictures(int albumId)
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
                        pic.Album = albumId;
                        db.Pictures.Add(pic);
                        db.Albums.Find(albumId).Pictures.Add(pic);
                        picList.Add(pic);
                        db.SaveChangesAsync();
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
            return Content(JsonConvert.SerializeObject(picList), "application/json"); 
        }
    }
}