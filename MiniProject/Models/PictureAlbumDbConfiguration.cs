using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Web;
using System.Data.Entity.Migrations;

namespace MiniProject.Models
{
        public class PictureAlbumDbConfiguration : DropCreateDatabaseIfModelChanges<PictureAlbumDbContext>
        {
            protected override void Seed(PictureAlbumDbContext context)
            {
            }
        }
    }
