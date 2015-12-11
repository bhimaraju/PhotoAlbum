using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Web;

namespace MiniProject.Models
{
    public class Album
    {
        public Album()
        {

        }

        public Album(string name, List<Picture> picList)
        {
            Name = name;
            Pictures = picList;
        }
        [Key]
        public int Id { get; set; }
        public String Name { get; set; }
        public Picture Thumbnail { get; set; }
        public virtual List<Picture> Pictures { get; set; }
        
    }
}