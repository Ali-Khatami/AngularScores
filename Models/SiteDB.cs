using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Web;

namespace AngularScores.Models
{
	public class SiteDB : DbContext
	{
		public SiteDB() : base("AngularScores") { }

		public DbSet<Student> Students { get; set; }
	}
}