using System.Web;
using System.Web.Optimization;

namespace AngularScores
{
	public class BundleConfig
	{
		// For more information on Bundling, visit http://go.microsoft.com/fwlink/?LinkId=254725
		public static void RegisterBundles(BundleCollection bundles)
		{
			bundles.Add(
				new ScriptBundle("~/bundles/3rdparty").Include(
					"~/Scripts/angular.{version}.js"
				)
			);

			bundles.Add(
				new ScriptBundle("~/bundles/SiteCommon").Include(
					"~/Scripts/Page.js"
				)
			);

			bundles.Add(
				new StyleBundle("~/Content/css/SiteCommon").Include(
					"~/Content/bootstrap/bootstrap.css",
					"~/Content/bootstrap/bootstrap-theme.css",
					"~/Content/site.css"
				)
			);

			// turn off minication to avoid issues with angular.js file
			BundleTable.EnableOptimizations = false;
		}
	}
}