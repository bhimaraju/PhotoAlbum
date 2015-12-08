using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Web;

namespace MiniProject.Models
{
    public class Picture
    {
        public Picture()
        {
            Location = "Cincinnati, Ohio";
        }

        public Picture(String name)
        {
            Name = name;
            
        }

        [Key]
        public int Id { get; set; }
        public String Name { get; set; }
        public DateTime? DateTaken { get; set; }

        [System.ComponentModel.DefaultValue("Cincinnati, Ohio")]
        public string Location { get; set; }

        public bool IsFavourite { get; set;}
        public int? Album { get; set; }
        public string ContentType { get; set; }
        public byte[] Content { get; set; }
        public int ContentLength { get; set; }
    }
}