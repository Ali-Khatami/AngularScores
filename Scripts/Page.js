function StudentsController($scope, $http, $filter, $q)
{
	// create the students object on $scope
	$scope.students = [];

	// watch for any changes on students
	$scope.$watch(
		'students',
		function (arUpdatedStudents, arOldStudents)
		{
			// loop through all the latest students. Call update for each one.
			for (var i = 0, j = arUpdatedStudents.length; i < j; i++)
			{
				var currStudent = arUpdatedStudents[i];

				$scope.updateStudent(currStudent);
			}
		},
		true // deep watch, this can become slow but it's necessary because we want to look for any changes to save to the serverside
	);

	$scope.topPerformers = [];
	$scope.worstPerformers = [];
	$scope.addStudentMessage = null;
	$scope.gradeRegex = /^([0-9]|[1-9][0-9]|100)$/;

	// Constant error messages
	$scope.STUDENT_NAME_MISSING_ERROR = "Student name is required.";
	$scope.GRADE_ERROR_MESSAGE = "Grade is required. Must be a number that represents a percent between 0 and 100";
	$scope.STUDENT_HAS_HIGHEST_GRADE_MESSAGE = "Student received highest grade on the test!";
	$scope.STUDENT_FAILING_GRADE_MESSAGE = "Student received a failing grade on the test, perhaps they need some more help?";
	$scope.STUDENT_OVER_100 = "Student received a grade above 100%. We don't allow extra credit."

	// dictionary of keys and deferred AJAX calls
	$scope.xhrQueue = {};
	
	// used for sorting...this is an awesome feature in angular
	$scope.predicate = '-name';

	// simple validation method to see if we should or should not save a user
	$scope.validateStudent = function (student, bCheckID)
	{
		var bIsValidStudent = false;

		// check all the important pieces to see if the student is valid or not.
		if (student && student.name && student.grade && !isNaN(student.grade) && student.grade >= 0 && student.grade <= 100)
		{
			bIsValidStudent = true;
		}

		// sometimes we need to check the id as well
		if (bCheckID && (!student.id || !bIsValidStudent))
		{
			bIsValidStudent = false;
		}

		return bIsValidStudent;
	};

	// action - 
	$scope.updateStudent = function (student)
	{
		// we don't want to save invalid states
		if (!$scope.validateStudent(student)) { return; }

		var sXHRQueueKey = student.id + student.name; // unique key
		// check if this is already in the queue, if so delete/abort/cancel it
		if ($scope.xhrQueue[sXHRQueueKey] && sXHRQueueKey.resolve)
		{
			sXHRQueueKey.resolve();
		}

		// store the deferred object
		$scope.xhrQueue[sXHRQueueKey] = $q.defer();

		// update the student
		$http.put('/AngularScores/API/Students/' + student.id, student, { timeout: $scope.xhrQueue[sXHRQueueKey].promise })
		.success(function (data, status, headers, config)
		{
			// we only care if there are errors
			if (status != 200) { $scope.updateStudent_error(); }
		})
		.error($scope.updateStudent_error);
	};

	$scope.updateStudent_error = function (data, status, headers, config)
	{
		alert("Error syncing student " + student.name + " with the server.");
	};

	// action - removes the student from the serverside using the id then refreshes the entire list to make sure its in sync
	// with the server
	$scope.removeStudent = function (student)
	{
		var arStudentsToKeep = [];

		$http.delete('/AngularScores/API/Students/' + student.id)
		.success(function (data, status, headers, config)
		{
			if (status == 200)
			{
				$scope.getAllStudents();
			}
		})
		.error(function (data, status, headers, config)
		{
			alert('Error deleting student');
		});
	};

	// action - grabs all the users from the server and sets the $scope property
	$scope.getAllStudents = function ()
	{
		$http.get('/AngularScores/API/Students/')
		.success(function (data, status, headers, config)
		{
			$scope.students = data;
			$scope.summarize();
		})
		.error(function (data, status, headers, config)
		{
			alert('Error getting students');
		});
	};

	// action - saving student on server and adding to ui ($scope collection)
	$scope.addStudent = function (newStudentForm, newStudent)
	{
		// make sure the form is valid before creating a user
		if (!newStudentForm.$valid || !$scope.validateStudent(newStudent)) { return; }
		
		$http.post('/AngularScores/API/Students', newStudent)
		.success(function (savedStudent, status, headers, config) { $scope.addStudent_success(newStudent, savedStudent, status, headers, config); })
		.error($scope.addStudent_error);
	};

	// deferred/async success function
	$scope.addStudent_success = function (newStudentFromForm, savedStudent, status, headers, config)
	{
		if ($scope.validateStudent(savedStudent, true))
		{
			$scope.students.push(savedStudent);
			newStudentFromForm.grade = null;
			newStudentFromForm.name = null;
			$scope.summarize();
		}
		else
		{
			alert("Error saving student. Please check inputs and try again.");
		}
	};

	// deferred/async success function
	$scope.addStudent_error = function (data, status, headers, config)
	{
		alert("Error creating student. Please check inputs and try again.");
	};

	$scope.summarize = function ()
	{
		var arAllGrades = [];
		var iTotalGradeValue = 0;

		angular.forEach(
			$scope.students,
			function (student)
			{
				if(!student.grade || isNaN(student.grade) || !student.name)
				{
					if (!student.name)
					{
						student.message = $scope.STUDENT_NAME_MISSING_ERROR;
					}
					else
					{
						student.message = $scope.GRADE_ERROR_MESSAGE;
					}
					student.cssClass = 'danger';
				}
				else if (student.grade > 100)
				{
					student.message = $scope.STUDENT_OVER_100;
					student.cssClass = 'danger';
				}
				else
				{
					// the value may have been mistyped unless the teacher allows extra credit
					if (student.grade < 65 && student.grade >= 0)
					{
						student.cssClass = 'warning';
						student.message = $scope.STUDENT_FAILING_GRADE_MESSAGE;
					}
					else
					{
						student.cssClass = null;
						student.message = null;
					}

					iTotalGradeValue += Number(student.grade);
					arAllGrades.push(Number(student.grade));
				}
			}
		);

		$scope.grades = {};

		if (arAllGrades && arAllGrades.length)
		{
			$scope.grades = {
				min: Math.min.apply(Math, arAllGrades),
				max: Math.max.apply(Math, arAllGrades),
				average: Math.round(iTotalGradeValue / arAllGrades.length)
			};
		}

		$scope.grades.maxDisplay = ($scope.grades.max || $scope.grades.max == 0) ? $scope.grades.max + "%" : "--";
		$scope.grades.minDisplay = ($scope.grades.min || $scope.grades.min == 0) ? $scope.grades.min + "%" : "--";
		$scope.grades.avgDisplay = ($scope.grades.average || $scope.grades.average == 0) ? $scope.grades.average + "%" : "--";

		// we are going to highlight students with the highest passing grade
		if ($scope.grades && $scope.grades.max > 65 && $scope.grades.max <= 100)
		{
			// now that we have the max value loop through all the students and check if they have the highest score.
			angular.forEach(
				$scope.students,
				function (student)
				{
					if ($scope.grades && $scope.grades.max && student.grade == $scope.grades.max)
					{
						student.cssClass = 'success';
						student.message = $scope.STUDENT_HAS_HIGHEST_GRADE_MESSAGE;
					}
				}
			);
		}
	};

	// Get all the students from the serverside storage
	$scope.getAllStudents();
}