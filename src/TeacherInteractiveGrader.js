import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import logo from './logo.svg';
import './App.css';
import MathInput from './MathInput.js';
import TeX from './TeX.js';
import ProblemGrader from './ProblemGrader.js';

var MathQuill = window.MathQuill;
var Khan = window.Khan;
var MathJax = window.MathJax;
var katex = window.katex;
var _ = window._;
var katexA11y = window.katexA11y;

var JSZip = window.JSZip ;
var $ = window.$;
var KAS = window.KAS;
var JsDiff = window.JsDiff;
var Chart = window.Chart;
var saveAs = window.saveAs;

var SET_ASSIGNMENTS_TO_GRADE = 'SET_ASSIGNMENTS_TO_GRADE';

var LAST_SHOWN_STEP = 'LAST_SHOWN_STEP';
var ASSIGNMENT_NAME = 'ASSIGNMENT_NAME';
var PROBLEMS = 'PROBLEMS';

var SIMILAR_ASSIGNMENT_GROUP_INDEX = "SIMILAR_ASSIGNMENT_GROUP_INDEX";
var SIMILAR_ASSIGNMENT_SETS = "SIMILAR_ASSIGNMENT_SETS";
// teacher grading actions
var VIEW_SIMILAR_ASSIGNMENTS = "VIEW_SIMILAR_ASSIGNMENTS";
// Problem properties
var PROBLEM_NUMBER = 'PROBLEM_NUMBER';
var STEPS = 'STEPS';

var VIEW_GRADES = 'VIEW_GRADES';
var NAV_BACK_TO_GRADING = 'NAV_BACK_TO_GRADING';

// properties of the state when showing grade view
// just a wrapper for the grades and total possible points for now
var GRADE_INFO = 'GRADE_INFO';
var STUDENT_GRADES = 'STUDENT_GRADES';
// Also uses POSSIBLE_POINTS from below

// Object model for teacher grading experience, see return value in the aggreateStudentWork() method
var STUDENT_FILE = 'STUDENT_FILE';
var ASSIGNMENT = 'ASSIGNMENT';
var UNIQUE_ANSWERS = 'UNIQUE_ANSWERS';
var AUTOMATICALLY_ASSIGNED_SCORE = 'AUTOMATICALLY_ASSIGNED_SCORE';
var PROBLEM_SCORE = 'PROBLEM_SCORE';
var SUCCESS = 'SUCCESS';
var ERROR = 'ERROR';
var HIGHLIGHT = 'HIGHLIGHT';

// answer key properties
var GRADE_STRATEGY = "GRADE_STRATEGY";
var ALL_ANSWERS_REQUIRED = "ALL_ANSWERS_REQUIRED";
var ONE_ANSWER_REQUIRED = "ONE_ANSWER_REQUIRED";
var SUBSET_OF_ANSWERS_REQUIRED = "SUBSET_OF_ANSWERS_REQUIRED";
var NUMBER_OF_MATCHING_ANSWERS_REQUIRED = "NUMBER_OF_MATCHING_ANSWERS_REQUIRED";
var POSSIBLE_POINTS = "POSSIBLE_POINTS";
// as the points already assigned for all work on a problem need to be scaled
// wen the possible points changes, and the old a new values need to be
// known at the time of the recalculation, user input is stored in this field
// until the field is submitted (with a button, pressing enter key or focus loss)
var POSSIBLE_POINTS_EDITED = "POSSIBLE_POINTS_EDITED";
var ANSWER_CLASSES = "ANSWER_CLASSES";
var ANSWERS = "ANSWERS";
var SCORE = "SCORE";
var FEEDBACK = "FEEDBACK";
var SIMILAR_ASSIGNMENT_GROUP_INDEX = "SIMILAR_ASSIGNMENT_GROUP_INDEX";
var SIMILAR_ASSIGNMENT_SETS = "SIMILAR_ASSIGNMENT_SETS";

// teacher grade page model properties
var STUDENT_WORK = "STUDENT_WORK";
var ANSWER = "ANSWER";
var CONTENT = "CONTENT";

var SHOW_ALL = "SHOW_ALL";

// teacher grading actions
var VIEW_SIMILAR_ASSIGNMENTS = "VIEW_SIMILAR_ASSIGNMENTS";
// action property declared above: SIMILAR_ASSIGNMENT_GROUP_INDEX

// action properties
// PROBLEM_NUMBER, SOLUTION_CLASS_INDEX, SCORE, SOLUTION_INDEX
var GRADE_SINGLE_SOLUTION = "GRADE_SINGLE_SOLUTION";
// action properties
// PROBLEM_NUMBER, SOLUTION_CLASS_INDEX, SCORE
var GRADE_CLASS_OF_SOLUTIONS = "GRADE_CLASS_OF_SOLUTIONS";
// action properties: MODE (JUST_UNGRADED | ALL)
var MODE = "MODE";
var JUST_UNGRADED = "JUST_UNGRADED"
var ALL = "ALL";

var HIGHLIGHT_STEP = 'HIGHLIGHT_STEP';
var HIGHLIGHT_TYPE = 'HIGHLIGHT_TYPE';

function findSimilarStudentAssignments(allStudentWork) {
    // 2d array of student names whose docs were similar
    var allSimilarityGroups = [];
    // map from student names to hash set with group id's
    var groupMemberships = {};

    // TODO - FINISH FLAGGING DOCS NOT SHOWING ENOUGH WORK
    // average amount of work on each problem

    // calculate average length of answer accross all docs
    var totalWork = 0
    var totalProblemsCompleted = 0;
    var totalProblemsAttempted = 0;
    var maxProblemsAttempted = 0;
    allStudentWork.forEach(function(assignment, index, array) {
        if (assignment[ASSIGNMENT].length > maxProblemsAttempted) maxProblemsAttempted = assignment[ASSIGNMENT].length;
        totalProblemsAttempted += assignment[ASSIGNMENT].length;
        assignment[ASSIGNMENT].forEach(function(problem, index, array) {
            totalWork += problem[STEPS].length;
            totalProblemsCompleted++;
        });
    });
    var averageAnswerLength = totalWork / totalProblemsCompleted;
    var averageNumberOfQuestions = totalProblemsAttempted / allStudentWork.length;

    allStudentWork.forEach(function(assignment1, index, array) {
        allStudentWork.forEach(function(assignment2, index, array) {
            if (assignment1[STUDENT_FILE] == assignment2[STUDENT_FILE]) return;
            var result = JsDiff.diffJson(assignment1, assignment2);
            // currently a rough threshold of 30% unique work, will improve later
            // the -2 is to adjust for the filename difference in the structures
            if ((result.length - 2) / 2.0 < averageNumberOfQuestions * averageAnswerLength * 0.3) {
                // is the first assignment matched with at least one similarity group
                var matchingGroup = groupMemberships[assignment1[STUDENT_FILE]];
                // does assignment 1 already belong to match groups, if so just add
                // assignment 2 to each of those, TODO - missing a loop?
                // TODO - need a length here?
                if (matchingGroup >= 0) {
                    if (groupMemberships[assignment2[STUDENT_FILE]] >= 0) return;
                    allSimilarityGroups[matchingGroup].push(assignment2[STUDENT_FILE]);
                    groupMemberships[assignment2[STUDENT_FILE]] = matchingGroup;
                } else {
                    groupMemberships[assignment1[STUDENT_FILE]] = allSimilarityGroups.length;
                    groupMemberships[assignment2[STUDENT_FILE]] = allSimilarityGroups.length;
                    allSimilarityGroups.push([assignment1[STUDENT_FILE], assignment2[STUDENT_FILE]]);
                }
            }
        });
    });
    return allSimilarityGroups;
}

function calculateGradingOverview(allProblems) {
    var totalPossiblePoints = 0;
    /*
        Structure:
        {
            PROBLEMS : [
            { PROBLEM_NUMBER : "1.1", NUMBER_UNIQUE_ANSWERS : 5, LARGEST_ANSWER_GROUP_SIZE : 10,
              AVG_ANSWER_GROUP_SIZE : 5.6, POSSIBLE_POINTS : 3
            ]
        }
    */
    var gradeOverview = {};
    gradeOverview["PROBLEMS"] = [];
    for (var problemNumber in allProblems) {
        if (allProblems.hasOwnProperty(problemNumber)) {
            var possiblePoints = allProblems[problemNumber][POSSIBLE_POINTS];
            totalPossiblePoints += possiblePoints;
            var uniqueAnswers = allProblems[problemNumber][UNIQUE_ANSWERS];
            var currentProblemOverview = { "PROBLEM_NUMBER" : problemNumber, "POSSIBLE_POINTS" : possiblePoints,
                                           "NUMBER_UNIQUE_ANSWERS" : uniqueAnswers.length};
            var largestAnswerGroupSize = 0;
            var totalAnswersSubmitted = 0;
            uniqueAnswers.forEach(function(allWorkWithForSingleSolution, index, arr) {
                if (allWorkWithForSingleSolution[STUDENT_WORK].length > largestAnswerGroupSize) {
                    largestAnswerGroupSize = allWorkWithForSingleSolution[STUDENT_WORK].length;
                }
                totalAnswersSubmitted += allWorkWithForSingleSolution[STUDENT_WORK].length;
                //allWorkWithForSingleSolution[STUDENT_WORK].forEach(function(singleSolution, index, arr) {
                    // TODO - don't think I want to do anythings for individual solutions, but think about this
                //});
            });
            currentProblemOverview["LARGEST_ANSWER_GROUP_SIZE"] = largestAnswerGroupSize;
            currentProblemOverview["AVG_ANSWER_GROUP_SIZE"] = totalAnswersSubmitted / uniqueAnswers.length;
            gradeOverview["PROBLEMS"].push(currentProblemOverview);
        }
    }
	gradeOverview[PROBLEMS] = gradeOverview[PROBLEMS].sort(function(a,b) { return a["LARGEST_ANSWER_GROUP_SIZE"] - b["LARGEST_ANSWER_GROUP_SIZE"];});
    return gradeOverview;
}

// PROBLEMS : { "1.a" : {
//      "POSSIBLE_POINTS : 3,
//      "UNIQUE_ANSWERS" : [ { ANSWER : "x=7", FILTER : "SHOW_ALL"/"SHOW_NONE", STUDENT_WORK : [ {STUDENT_FILE : "jason", AUTOMATICALLY_ASSIGNED_SCORE : 3,
//                             STEPS : [ { CONTENT : "2x=14"},{ CONTENT : "x=7", HIGHLIGHT : SUCCESS ]} ] } } ]}
function separateIndividualStudentAssignments(aggregatedAndGradedWork) {
    // TODO - when reading in student files above make sure to uniquify names that overlap and give a warning
    // map indexed by student assignment filename
    var assignments = {};
    var allProblems = aggregatedAndGradedWork[PROBLEMS];

    for (var problemNumber in allProblems) {
        if (allProblems.hasOwnProperty(problemNumber)) {
            var possiblePoints = allProblems[problemNumber][POSSIBLE_POINTS];
            var uniqueAnswers = allProblems[problemNumber][UNIQUE_ANSWERS];
            uniqueAnswers.forEach(function(allWorkWithForSingleSolution, index, arr) {
                allWorkWithForSingleSolution[STUDENT_WORK].forEach(function(singleSolution, index, arr) {
                    var studentAssignment = assignments[singleSolution[STUDENT_FILE]];
                    studentAssignment = (typeof studentAssignment != 'undefined') ? studentAssignment : {PROBLEMS : []};
                    var singleSolutionCloned = _.cloneDeep(singleSolution);
                    singleSolutionCloned[PROBLEM_NUMBER] = problemNumber;
                    singleSolutionCloned[POSSIBLE_POINTS] = possiblePoints;
                    delete singleSolutionCloned[STUDENT_FILE];
                    delete singleSolutionCloned[AUTOMATICALLY_ASSIGNED_SCORE];
                    // TODO - should it assert here that a score has been given?
                    // The app fills in a score of 0 for everything right now when
                    // student assignments are opened
                    studentAssignment[PROBLEMS].push(singleSolutionCloned);
                    assignments[singleSolution[STUDENT_FILE]] = studentAssignment;
                });
            });
        }
    }
    return assignments;
}

function saveGradedStudentWork(gradedWork) {
    if (gradedWork === undefined) {
        console.log("no graded assignments to save");
    }
    // temporarily disable data loss warning
    window.onbeforeunload = null;

    var separatedAssignments = separateIndividualStudentAssignments(gradedWork);
    var zip = new JSZip();
    for (var filename in separatedAssignments) {
        if (separatedAssignments.hasOwnProperty(filename)) {
            zip.file(filename, JSON.stringify(separatedAssignments[filename]));
        }
    }
    var content = zip.generate();

    window.location.href="data:application/zip;base64," + content;
    setTimeout(function() { window.onbeforeunload = function() { return true; }}, 500);
}

// returns score out of total possible points that are specified in the answer key
function gradeSingleProblem(problem, answerKey) {
    var automaticallyAssignedGrade;
    var problemKey = answerKey[problem[PROBLEM_NUMBER]];
    window.$.each(problemKey[ANSWER_CLASSES], function(answerClassIndex, answerClass) {
        var exitEarly = false;
        if (answerClass[GRADE_STRATEGY] === ONE_ANSWER_REQUIRED) {
            window.$.each(answerClass[ANSWERS], function(answerIndex, answer) {
            var studentAnswer = _.last(problem[STEPS])[CONTENT];
            // TODO - better expression comparison
            // var expr1 = KAS.parse(answer).expr;
            // var expr2 = KAS.parse(studentAnswer).expr;
            // if (KAS.compare(expr1, expr2).equal) {
            if (answer == studentAnswer) {
                // TODO - good rounding
                automaticallyAssignedGrade = answerKey[problem[PROBLEM_NUMBER]][POSSIBLE_POINTS] * answerClass[SCORE];
                exitEarly = true;
                return false; // early terminate loops
            }
            });
        } else {
        alert("This grading strategy has not been implemented - " + answerClass[GRADE_STRATEGY]);
        }
        if (exitEarly) return false;
    });
    return automaticallyAssignedGrade;
}

// Transforms a list of student assignments into a structure where all work for one problem
// is stored together, separated by different final answers reached by groups of students.
//
// In the answer key, scores on individual answers are given as a float value from [0,1).
// The grading strategy for individual problems (how to handle partial credit, fractional points
// and allowing users to scale some problems to be worth more points, is still being decided).
// Can't just use floating point for fractional points because users will expecting them to add up
// cleanly. Even if I decide on some fractional system, floating point partial credit scores would
// be safe enough to import with rounding. The again might just be over-thinking it and floats even
// after aggregation would be fine for "snapping" to common fractional values, just need to store
// all raw input so it can be shown back to users as what they entered.
//
// Params:
// allStudentWork:
//      [ {STUDENT_FILE : "jake r.", ASSIGNMENT: [{PROBLEM_NUMBER : 1, "STEPS" : []}]]
// answerKey: - list of problem numbers with answers, given as a map with the problem numbers as keys
//              non-numeric keys are considered valid to allow 1.a, iii, 5.11, etc./
//              NUMBER_OF_MATCHING_ANSWERS_REQUIRED is only valid to set if SUBSET_OF_ANSWERS_REQUIRED is specified.
//              Each answer class has its own GRADE_STRATEGY because for a question with multiple answers, the partial
//              credit options will likely be defined as SUBSET_OF_ANSWERS_REQUIRED
//      { "1" : { POSSIBLE_POINTS : 3, "ANSWER_CLASSES" : [
//                { SCORE : 1, ANSWERS : ["x=5", "5=x"], "GRADE_STRATEGY" : "ALL_ANSWERS_REQUIRED" },
//                { "SCORE" : 0.5, ANSWERS : ["x=-5","-5=x"] ],
//                      "GRADE_STRATEGY" : "ALL_ANSWERS_REQUIRED" | "ONE_ANSWER_REQUIRED" |
//                      "SUBSET_OF_ANSWERS_REQUIRED", "NUMBER_OF_MATCHING_ANSWERS_REQUIRED" : 2 } ]
//
// Returns:
// CURRENT_FILTERS : { SIMILAR_ASSIGNMENT_GROUP_INDEX : 1, ANONYMOUS : true/false }
// SIMILAR_ASSIGNMENT_SETS : [ [ "jason", "emma", "matt"], ["jim", "tim"] ],
// PROBLEMS : { "1.a" : {
//      "POSSIBLE_POINTS : 3,
//      "UNIQUE_ANSWERS" : [ { ANSWER : "x=7", FILTER : "SHOW_ALL"/"SHOW_NONE", STUDENT_WORK : [ {STUDENT_FILE : "jason", AUTOMATICALLY_ASSIGNED_SCORE : 3,
//                             STEPS : [ { CONTENT : "2x=14"},{ CONTENT : "x=7", HIGHLIGHT : SUCCESS ]} ] } } ]}
function aggregateStudentWork(allStudentWork, answerKey = {}) {
    var aggregatedWork = {};
    // used to simplify filling in a flag for missing work if a student does not do a problem
    // structure: { "1.1" : { "jason" :true, "taylor" : true }
    var studentWorkFound = {};
    allStudentWork.forEach(function(assignInfo, index, array) {
        assignInfo[ASSIGNMENT].forEach(function(problem, index, array) {
            var studentAnswer = problem[STEPS][problem[LAST_SHOWN_STEP]][CONTENT];
            // TODO - consider if empty string is the best way to indicate "not yet graded"/complete
            var automaticallyAssignedGrade = "";
            if (!window.$.isEmptyObject(answerKey)) {
                // this problem did not appear in the answer key
                if (!answerKey[problem[PROBLEM_NUMBER]]) {
                    // TODO - consider if empty string is the best way to indicate "not yet graded"/complete
                    automaticallyAssignedGrade = "";
                } else {
                    automaticallyAssignedGrade = gradeSingleProblem(problem, answerKey);
                }
            }

            // write into the abreviated list of problems completed, used below to fill in placeholder for
            // completely absent work
            var allStudentsWhoDidThisProblem = studentWorkFound[problem[PROBLEM_NUMBER]];
            allStudentsWhoDidThisProblem = (typeof allStudentsWhoDidThisProblem != 'undefined') ? allStudentsWhoDidThisProblem : {};
            allStudentsWhoDidThisProblem[assignInfo[STUDENT_FILE]] = true;
            studentWorkFound[problem[PROBLEM_NUMBER]] = allStudentsWhoDidThisProblem;

            var problemSummary = aggregatedWork[problem[PROBLEM_NUMBER]];
            problemSummary = (typeof problemSummary != 'undefined') ? problemSummary : {};

            var uniqueAnswers = problemSummary[UNIQUE_ANSWERS];
            uniqueAnswers = ( typeof uniqueAnswers != 'undefined') ? uniqueAnswers : [];

            // see notes for comment about how to organize problems once final answers are compared in
            // a fuzzy fashion
            var workList;
            var indexInUniqueAnswersList;
            uniqueAnswers.forEach(function(aggregatedWorkForOneAnswer, index, arr) {
                // TODO - add better comparison that will not have to match the latex exactly
                var groupAnswer = KAS.parse(aggregatedWorkForOneAnswer[ANSWER]).expr;
                var parsedStudentAnswer = KAS.parse(studentAnswer).expr;
                if (KAS.compare(groupAnswer, parsedStudentAnswer).equal && groupAnswer.sameForm(parsedStudentAnswer)) {
                    workList = aggregatedWorkForOneAnswer;
                    indexInUniqueAnswersList = index;
                    return false;
                }
            });
            if (typeof workList === 'undefined' || !(workList instanceof Object) ) {
                workList = { ANSWER : studentAnswer, FILTER : SHOW_ALL, STUDENT_WORK : []};
                indexInUniqueAnswersList = uniqueAnswers.length;
            }
            var feedback = '';
            // reopening previously graded assignments
            if (problem[SCORE] !== undefined) {
                automaticallyAssignedGrade = problem[SCORE];
                feedback = problem[FEEDBACK];
            }
            workList[STUDENT_WORK].push(
                { STUDENT_FILE : assignInfo[STUDENT_FILE],
                  AUTOMATICALLY_ASSIGNED_SCORE : automaticallyAssignedGrade,
                  SCORE : automaticallyAssignedGrade,
                  FEEDBACK : feedback,
                  LAST_SHOWN_STEP : problem[LAST_SHOWN_STEP],
                  STEPS : problem[STEPS].slice(0, problem[LAST_SHOWN_STEP] + 1)}
            );
            uniqueAnswers[indexInUniqueAnswersList] = workList;
            problemSummary[UNIQUE_ANSWERS] = uniqueAnswers;
            // this is currently redundant, but the next step to order all of the problems based
            // on which ones most students go wrong with rewrite the keys to numeric ones
            if (!window.$.isEmptyObject(answerKey)) {
                problemSummary[POSSIBLE_POINTS] = answerKey[problem[PROBLEM_NUMBER]][POSSIBLE_POINTS];
            } else {
                problemSummary[POSSIBLE_POINTS] = 6;
             }
            // this is necessary because this might be the first time this problem number was seen so we just created the list
            // if this wasn't the case, this wouldn't be necessary because objects including arrays are always passed by reference
            aggregatedWork[problem[PROBLEM_NUMBER]] = problemSummary;
        });
    });
    for (var problemNumber in aggregatedWork) {
        if (aggregatedWork.hasOwnProperty(problemNumber)) {
            var uniqueAnswers = aggregatedWork[problemNumber][UNIQUE_ANSWERS];
            uniqueAnswers.forEach(function(uniqueAnswer, index, arr) {
                uniqueAnswer[STUDENT_WORK].sort(function(a,b) { return a[LAST_SHOWN_STEP] - b[LAST_SHOWN_STEP]; });
            });
        }
    }
    // TODO - need to add this back
    // TODO - need to think about how this handles outliers that do a wrong problem
    //        should probably only add these for questions where a majority of students answered a question
    //        need to give a clear experience for teachers, currently this will throw off score calculation
    /*
    // add blank answers for any students missing problems
    $.each(allStudentWork, function(index, assignInfo) {
        $.each(studentWorkFound, function(problemNumber, studentsFound) {
            if (!studentsFound[assignInfo.filename]) {
                var missingWork = aggregatedWork[problemNumber]['uniqueAnswers']['unanswered'];
                missingWork = (typeof missingWork != 'undefined') ? missingWork : [];
                missingWork.push(
                        {studentFile : assignInfo.filename, autoGradeStatus: 'incorrect', steps : ['unanswered']});
                aggregatedWork[problemNumber]['uniqueAnswers']['unanswered'] = missingWork;
            }
        });
    });
    */

    // similarity check does a generic diff on JSON docs, for re-opened docs this will include data intermixed
    // for the grading marks
    // Loop through the structure to remove all grading marks from the versions that will be used to compare the students
    // TODO - try to remove this deep clone of all docs, don't know if it is safe today to mutate the incoming data
    allStudentWork = _.cloneDeep(allStudentWork);
    allStudentWork.forEach(function(assignInfo, index, array) {
        assignInfo[ASSIGNMENT].forEach(function(problem, index, array) {
            problem[FEEDBACK] = "";
            problem[SCORE] = "";
            problem[STEPS].forEach(function(step, index, array) {
                if (step[HIGHLIGHT])
                    delete step[HIGHLIGHT];
            });
        });
    });
    var similarAssignments = findSimilarStudentAssignments(allStudentWork);
    return { CURRENT_FILTERS : { SIMILAR_ASSIGNMENT_GROUP_INDEX : null, ANONYMOUS : true },
    SIMILAR_ASSIGNMENT_SETS : similarAssignments, PROBLEMS : aggregatedWork }
}

// TODO - delete this, highlights now shown in student experience for viewing
// feedback on a graded assignment.
// currently in the student model, the steps associated with a problem
// are a simple array of strings with Latex in them. In the teacher
// gradng model, each step is wrapped in an object to allow for storing
// metadata with each step. Current usage is to show a highlight of an
// error or success identified by the teacher on that step.
function wrapSteps(studentSteps) {
    var wrappedSteps = [];
    studentSteps.forEach(function(step, index, arr) {
        wrappedSteps.push({CONTENT : step});
    });
    return wrappedSteps;
}

function convertToCurrentFormat(possiblyOldDoc) {
    if (!possiblyOldDoc.hasOwnProperty('problems')) {
        return possiblyOldDoc;
    }

    possiblyOldDoc.problems.forEach(function (problem) {
        if (problem.problemNumber !== undefined) {
            problem[STEPS] = wrapSteps(problem.steps);
            problem[LAST_SHOWN_STEP] = problem[STEPS].length - 1;
            problem[PROBLEM_NUMBER] = problem.problemNumber;
            delete problem.steps;
            delete problem.problemNumber;
        }
    });
    possiblyOldDoc[PROBLEMS] = possiblyOldDoc.problems;
    delete possiblyOldDoc.problems;
    return possiblyOldDoc;
}

// open zip file full of student assignments for grading
function studentSubmissionsZip(evt) {
    console.log("studentSubmissionsZip");
    // reset scroll location from previous view of student docs
    window.location.hash = '';
    var f = evt.target.files[0];

    if (f) {
        var r = new FileReader();
        r.onload = function(e) {
            var content = e.target.result;

            var new_zip = new JSZip();
            // more files !
            new_zip.load(content);

            var allStudentWork = [];

            // you now have every files contained in the loaded zip
            for (var file in new_zip.files) {
                // don't get properties from prototype
                if (new_zip.files.hasOwnProperty(file)) {
                    // extra directory added when zipping files on mac
                    // TODO - check for other things to filter out from zip
                    // files created on other platforms
                    if (file.indexOf("__MACOSX") > -1 || file.indexOf(".DS_Store") > -1) continue;
                    // filter out directories which are part of this list
                    if (new_zip.file(file) == null) continue;
                    var fileContents = new_zip.file(file).asText();
                    // how is this behaviring differrntly than JSOn.parse()?!?!
                    //var assignmentData = window.$.parseJSON(fileContents);
					console.log("aaaa");
					fileContents = fileContents.trim();
					console.log(fileContents);
                    var assignmentData = JSON.parse(fileContents);
                    assignmentData = convertToCurrentFormat(assignmentData);
                    allStudentWork.push({STUDENT_FILE : file, ASSIGNMENT : assignmentData[PROBLEMS]});
                }
            }
            // TODO - add back answer key
            var aggregatedWork = aggregateStudentWork(allStudentWork);
            console.log("@@@@@@ opened docs");
            window.store.dispatch({type : SET_ASSIGNMENTS_TO_GRADE, NEW_STATE : aggregatedWork});
        }
        r.readAsArrayBuffer(f);
    } else {
        alert("Failed to load file");
    }
}

const TeacherInteractiveGrader = React.createClass({
    componentDidMount() {
		var gradingOverview = _.cloneDeep(window.store.getState()["GRADING_OVERVIEW"][PROBLEMS]);
		gradingOverview.sort(function(a,b) { return a["LARGEST_ANSWER_GROUP_SIZE"] - b["LARGEST_ANSWER_GROUP_SIZE"];});
		var labels = [];
		var numberUniqueAnswersData = {
			label: "Number unique answers",
			backgroundColor: "blue",
			data: []
		};
		var largestAnswerGroups = {
			label: "Largest answer group size",
			backgroundColor: "green",
			data: []
		};
		var averageAnswerGroups = {
			label: "Average answer group size",
			backgroundColor: "purple",
			data: []
		};
		var graphData = [numberUniqueAnswersData, largestAnswerGroups, averageAnswerGroups];
		gradingOverview.forEach(function(problemSummary, index, array) {
			labels.push(problemSummary[PROBLEM_NUMBER]);
			numberUniqueAnswersData["data"].push(problemSummary["NUMBER_UNIQUE_ANSWERS"]);
			largestAnswerGroups["data"].push(problemSummary["LARGEST_ANSWER_GROUP_SIZE"]);
			averageAnswerGroups["data"].push(problemSummary["AVG_ANSWER_GROUP_SIZE"]);
		});
        var chart = ReactDOM.findDOMNode(this.refs.chart);
        var onClickFunc = function(evt) {
            var activePoints = chart.getElementsAtEvent(evt);
            if (!activePoints || activePoints.length == 0) {
                return;
            }
            window.store.dispatch({ type : "SET_CURENT_PROBLEM", PROBLEM_NUMBER : labels[activePoints[0]["_index"]]});
            // TODO - not working correctly after making users grade single problem at a time
            // for now make them scroll past the graph and similar assignments themselves
            //window.location.hash = "#grade_problem";
        };
		chart = new Chart(chart.getContext('2d'), {
			type: 'bar',
			data: {
				labels: labels,
				datasets: graphData
			},
			options: {
				scales: {
					yAxes: [{
						ticks: {
							beginAtZero:true
						}
					}]
				},
                onClick: onClickFunc
			}
		});
  	},
    render: function() {
        // TODO - figure out the right way to do this
        // TODO - do I want to be able to change the sort ordering, possibly to put
        //        the most important to review problem first, rather than just the
        //        problems in order?

        var state = window.store.getState();
        var problems = state[PROBLEMS];
        var similarAssignments = state[SIMILAR_ASSIGNMENT_SETS];
        var currentSimilarityGroupIndex = state[SIMILAR_ASSIGNMENT_GROUP_INDEX];
        var currentProblem = state["CURRENT_PROBLEM"];

        return (
            <div>
                <span>To see work for a problem, click on one of the bars corresponding to your desired problem in the bar graph.</span>
            	<canvas ref="chart" width="400" height="50"></canvas>
                {/* TODO - finish option to grade anonymously <TeacherGraderFilters value={this.props.value}/> */}
                { (similarAssignments && similarAssignments.length > 0) ? (
                    <div className="similar-assignment-filters"><h3>Some students may have copied each others work.</h3>
                    {   (typeof(currentSimilarityGroupIndex) != "undefined" && currentSimilarityGroupIndex != null) ?
                            (<p> Currently viewing a group of similar assignments, back to grading full class: <input type="submit" value="View All" onClick={
                                function(evt) {
                                    window.store.dispatch({type : VIEW_SIMILAR_ASSIGNMENTS, SIMILAR_ASSIGNMENT_GROUP_INDEX : undefined});
                                }
                            }/></p>)
                        : null
                    }
                    {
                        function() {
                            var similarityGroups = [];
                            similarAssignments.forEach(function(similarityGroup, index, array) {
                                similarityGroups.push(
                                    (
                                        <p key={index}>
                                        { (index == currentSimilarityGroupIndex) ?
                                            (<b>A group of  {similarityGroup.length} students submitted similar assignments &nbsp;</b>)
                                           : (<span>A group of  {similarityGroup.length} students submitted similar assignments &nbsp;</span>)
                                        }
                                        <input type="submit" value="View" onClick={
                                            function(evt) {
                                                window.store.dispatch({type : VIEW_SIMILAR_ASSIGNMENTS, SIMILAR_ASSIGNMENT_GROUP_INDEX : index});
                                            }
                                        }/>
                                        </p>
                                    )
                                );
                            });
                            return similarityGroups;
                        }()
                    }
                    </div>
                    )
                   : null
                }

                <span id="grade_problem" />
                <div style={{paddingTop: "100px", marginTop: "-100px"}} />
                <div>
                {
                    function() {
                        var problemGraders = [];
                        var problemArray = [];
                        for (var property in problems) {
                            if (problems.hasOwnProperty(property)) {
                                // when viewing similar assignments show all problems, otherwise only show
                                // one problem at a time
                                if (property == currentProblem
                                        || (typeof(currentSimilarityGroupIndex) != "undefined"
                                        && currentSimilarityGroupIndex != null)) {
                                    // problem number is stored as keys in the map, add to each object
                                    // so the list can be sorted by problem number
                                    problems[property][PROBLEM_NUMBER] = property;
                                    problemArray.push(problems[property]);
                                }
                            }
                        }
                        problemArray = problemArray.sort(function(a,b) { return a[PROBLEM_NUMBER] - b[PROBLEM_NUMBER];});
                        problemArray.forEach(function(problem, index, array) {
                            problemGraders.push(
                                (<ProblemGrader problemInfo={problem}
                                                key={problem[PROBLEM_NUMBER]}
                                                problemNumber={problem[PROBLEM_NUMBER]}
                                    studentsToView={similarAssignments[currentSimilarityGroupIndex]}/> ));
                        });
                        return problemGraders;
                    }()
                }
                </div>
                <span>To grade other problems click on the bars corresponding to your desired problem in the bar graph at the top of the page.
                <input type="submit" id="scroll-to-top" value="Scroll to top" onClick={
                            function() {
                                window.location.hash = '';
                                document.body.scrollTop = document.documentElement.scrollTop = 0;}
                }/>
                <br />
                <br />
                </span>
            </div>
        );
    }
});

export { TeacherInteractiveGrader as default,
    studentSubmissionsZip,
    saveGradedStudentWork,
    gradeSingleProblem,
    aggregateStudentWork,
    separateIndividualStudentAssignments,
    calculateGradingOverview,
    convertToCurrentFormat};
