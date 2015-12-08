using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Web;

namespace MiniProject.Models
{
    public class PictureAlbumDbContext : DbContext
    {
        public DbSet<Album> Albums { get; set; }
        public DbSet<Picture> Pictures { get; set; }
    }
}