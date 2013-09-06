using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace AngularScores.Models
{
	public class Student
	{
		/// <summary>
		/// Unique ID for each student
		/// </summary>
		public int id { get; set; }
		
		/// <summary>
		/// The full name of the student
		/// </summary>
		public string name { get; set; }

		/// <summary>
		/// The grade on the test the student received.
		/// </summary>
		public double grade { get; set; }
	}
}