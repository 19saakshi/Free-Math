import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import logo from './logo.svg';
import './App.css';
import MathInput from './MathInput.js';
import TeX from './TeX.js';

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
/*

  	Unexpected use of 'location'  no-restricted-globals
  ret' is not defined          no-undef
  value' is not defined        no-undef

 */

// TODO - THIS IS NOT THE RIGHT WAY TO DO THIS, INSTEAD FIND A VERSION OF LODASH COMPATIBLE WITH KAS

_.cloneDeep = function(oldObject) { return JSON.parse(JSON.stringify(oldObject)); };

// copied from here, didn't seem worth adding a dependency, I'm sure the JS people will cure me of that eventually...
// https://github.com/substack/deep-freeze/blob/master/index.js
function deepFreeze (o) {
  Object.freeze(o);

  Object.getOwnPropertyNames(o).forEach(function (prop) {
    if (o.hasOwnProperty(prop)
    && o[prop] !== null
    && (typeof o[prop] === "object" || typeof o[prop] === "function")
    && !Object.isFrozen(o[prop])) {
      deepFreeze(o[prop]);
    }
  });

  return o;
};

const UNTITLED_ASSINGMENT = 'Untitled Assignment';

// Application state properties
// TODO - use these as the actual keys in object literals in the reducer
// when I have ES6 and Babel

// Redux things
var type = 'type';

// Application modes
var APP_MODE = 'APP_MODE';
var EDIT_ASSIGNMENT = 'EDIT_ASSIGNMENT';
var GRADE_ASSIGNMENTS = 'GRADE_ASSIGNMENTS';
var MODE_CHOOSER = 'MODE_CHOOSER';

// Actions to change modes
var GO_TO_MODE_CHOOSER = 'GO_TO_MODE_CHOOSER';
var SET_ASSIGNMENTS_TO_GRADE = 'SET_ASSIGNMENTS_TO_GRADE';
// action properties
var NEW_STATE = 'NEW_STATE';
// when grading, open the view where overall student grades are show
var SET_TO_VIEW_GRADES = 'SET_TO_VIEW_GRADES';
// the state resulting from above ttanstion action
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
var SHOW_ALL = "SHOW_ALL";
var SHOW_NONE = "SHOW_NONE";
var STUDENT_WORK = "STUDENT_WORK";
var ANSWER = "ANSWER";
var CONTENT = "CONTENT";

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
// HIGHLIGHT_TYPE : (ERROR | SUCCESS)

var SOLUTION_CLASS_INDEX = "SOLUTION_CLASS_INDEX";
var SET_PROBLEM_FEEDBACK = "SET_PROBLEM_FEEDBACK";
var HIDE_CLASS_OF_SOLUTIONS = "HIDE_CLASS_OF_SOLUTIONS";
var TOGGLE_GRADING_ANONYMOUSLY = "TOGGLE_GRADING_ANONYMOUSLY";
var SET_PROBLEM_POSSIBLE_POINTS = "SET_PROBLEM_POSSIBLE_POINTS";
var EDIT_POSSIBLE_POINTS = "EDIT_POSSIBLE_POINTS";
var OLD_POSSIBLE_POINTS = "OLD_POSSIBLE_POINTS";

var SOLUTION_INDEX = "SOLUTION_INDEX";

// Assignment properties
var ASSIGNMENT_NAME = 'ASSIGNMENT_NAME';
var PROBLEMS = 'PROBLEMS';

// Problem properties
var PROBLEM_NUMBER = 'PROBLEM_NUMBER';
var STEPS = 'STEPS';
// to implement undo/redo and index for the last step
// to show is tracked and moved up and down
// when this is not at the end of the list and a new
// step is added it moves to the end of the list as
// the redo history in this case will be lost
var LAST_SHOWN_STEP = 'LAST_SHOWN_STEP';

// editing assignmnt mode actions
var SET_ASSIGNMENT_NAME = 'SET_ASSIGNMENT_NAME';
// used to swap out the entire content of the document, for opening
// a document from a file
var SET_ASSIGNMENT_CONTENT = 'SET_ASSIGNMENT_CONTENT';

// student assignment actions
var ADD_PROBLEM = 'ADD_PROBLEM';
// remove problem expects an "index" property
// specifying which problem to remove
var REMOVE_PROBLEM = 'REMOVE_PROBLEM';
var CLONE_PROBLEM = 'CLONE_PROBLEM';

// this action expects:
// PROBLEM_INDEX - for which problem to change
// NEW_PROBLEM_NUMBER - string with problem number, not a numberic
//                    type because the problem might be 1.a, etc.
var PROBLEM_INDEX = 'PROBLEM_INDEX';
var NEW_PROBLEM_NUMBER = 'NEW_PROBLEM_NUMBER';
var SET_PROBLEM_NUMBER = 'SET_PROBLEM_NUMBER';

// key used to refer to one step in a series of student work
var STEP_KEY = 'STEP_KEY';
// key used to refer to data to place at a given step
// currently will just be a string with latex, but may change
// type if other metadata needs to be stored with each step
// such as a flag the student could set to indicate more than
// 1 final answer
var NEW_STEP_CONTENT = 'NEW_STEP_CONTENT';

// this action expects:
// PROBLEM_INDEX - for which problem to change
// STEP_KEY - index into the work steps for the given problem
// NEW_STEP_CONTENT - string for the new expression to write in this step
var EDIT_STEP = 'EDIT_STEP';
// TODO - decide if I want to add a feature to splice in
// a new step partway through a current problem
// this action expects an index for which problem to change
var NEW_STEP = 'NEW_STEP';
// this action expects an index for which problem to change
var UNDO_STEP = 'UNDO_STEP';
// this action expects an index for which problem to change
var REDO_STEP = 'REDO_STEP';

// CSS constants
var SOFT_RED = '#FFDEDE';
var RED = '#FF99CC';
var GREEN = '#2cff72';
var YELLOW = '#FFFDBF';

// open zip file full of student assignments for grading
function studentSubmissionsZip(evt) {

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
            window.store.dispatch({type : SET_ASSIGNMENTS_TO_GRADE, NEW_STATE : aggregatedWork});
        }
        r.readAsArrayBuffer(f);
    } else {
        alert("Failed to load file");
    }
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

//      [ { "PROBLEM_NUMBER" : "1", POSSIBLE_POINTS : 3, "ANSWER_CLASSES" : [ { SCORE : 1, ANSWERS : ["x=5", "5=x"]}, { "SCORE" : 0.5, ANSWERS : ["x=-5","-5=x"] ],
//          "GRADE_STRATEGY" : "ALL_ANSWERS_REQUIRED" | "ONE_ANSWER_REQUIRED" | "SUBSET_OF_ANSWERS_REQUIRED", "NUMBER_OF_MATCHING_ANSWERS_REQUIRED" : 2 } ]
function testGradeProblem() {
    var answerKey = { "1" : { POSSIBLE_POINTS : 3,
                        ANSWER_CLASSES : [  { SCORE : 1, ANSWERS : ["x=5", "5=x"], GRADE_STRATEGY : ONE_ANSWER_REQUIRED },
                                            { SCORE : 0.5, ANSWERS : ["x=-5", "-5=x"], GRADE_STRATEGY : ONE_ANSWER_REQUIRED }] } };
    var studentAnswer1 = { PROBLEM_NUMBER : 1, STEPS : [ {CONTENT : "2x=10"}, {CONTENT : "x=5"}]};
    var studentAnswer2 = { PROBLEM_NUMBER : 1, STEPS : [ {CONTENT : "2x=10"}, {CONTENT : "x=-5"}]};
    expect(gradeSingleProblem(studentAnswer1, answerKey)).toEqual(3);
    expect(gradeSingleProblem(studentAnswer2, answerKey)).toEqual(1.5);
}

function testAggregateStudentWork() {
    var allStudentWork = [ {STUDENT_FILE : "jake r.", ASSIGNMENT: [{PROBLEM_NUMBER : 1, LAST_SHOWN_STEP : 1, STEPS : [
                                { CONTENT : "5x=10"}, { CONTENT : "x=2"}]}]},
                           {STUDENT_FILE : "jon m.", ASSIGNMENT: [{PROBLEM_NUMBER : 1, LAST_SHOWN_STEP : 1, STEPS : [
                                { CONTENT : "5x=10"}, { CONTENT : "x=-2"}]}]} ];
    var answerKey = { "1" : {
            POSSIBLE_POINTS : 3,
            ANSWER_CLASSES : [ { SCORE : 1, ANSWERS : ["x=2", "2=x"], GRADE_STRATEGY : ONE_ANSWER_REQUIRED},
                                { SCORE : 0.5, ANSWERS : ["x=-2","-2=x"], GRADE_STRATEGY : ONE_ANSWER_REQUIRED } ],
            } };
    var expectedOutput = {
        CURRENT_FILTERS : { SIMILAR_ASSIGNMENT_GROUP_INDEX : null, ANONYMOUS : true },
        SIMILAR_ASSIGNMENT_SETS : [ ],
        PROBLEMS : { "1" : {
            POSSIBLE_POINTS : 3,
            UNIQUE_ANSWERS : [
                { ANSWER : "x=2", FILTER : SHOW_ALL, STUDENT_WORK : [ {STUDENT_FILE : "jake r.", AUTOMATICALLY_ASSIGNED_SCORE : 3, SCORE : 3, FEEDBACK : "",
                    LAST_SHOWN_STEP : 1, STEPS : [ { CONTENT : "5x=10"},{ CONTENT : "x=2"} ] } ] },
                    { ANSWER : "x=-2", FILTER : SHOW_ALL, STUDENT_WORK : [ {STUDENT_FILE : "jon m.", AUTOMATICALLY_ASSIGNED_SCORE : 1.5,  SCORE : 1.5,FEEDBACK : "",
                    LAST_SHOWN_STEP: 1, STEPS : [ { CONTENT : "5x=10"},{ CONTENT : "x=-2"} ] } ] } ]
        } }
    };
    var output = aggregateStudentWork(allStudentWork, answerKey);
    expect(output).toEqual(expectedOutput);
}

function testSeparateAssignments() {
    var input = {
        CURRENT_FILTERS : { SIMILAR_ASSIGNMENT_GROUP_INDEX : null, ANONYMOUS : true },
        SIMILAR_ASSIGNMENT_SETS : [ ],
        PROBLEMS : { "1" : {
            POSSIBLE_POINTS : 3,
            UNIQUE_ANSWERS : [
                { ANSWER : "x=2", FILTER : SHOW_ALL, STUDENT_WORK : [ {STUDENT_FILE : "jake r.", AUTOMATICALLY_ASSIGNED_SCORE : 3, SCORE : 3, FEEDBACK : "",
                    STEPS : [ { CONTENT : "5x=10"},{ CONTENT : "x=2"} ] } ] },
                    { ANSWER : "x=-2", FILTER : SHOW_ALL, STUDENT_WORK : [ {STUDENT_FILE : "jon m.", FEEDBACK : "Watch your signs", AUTOMATICALLY_ASSIGNED_SCORE : 1.5,  SCORE : 1.5,
                    STEPS : [ { CONTENT : "5x=10"},{ CONTENT : "x=-2", HIGHLIGHT : ERROR} ] } ] } ]
        } }
    };

    // test separating the student work back out into individual assignments
    var separatedAssignments = separateIndividualStudentAssignments(input);

    var expectedOutput =
    {
        "jake r.": {
            "PROBLEMS": [{
                "SCORE": 3,
                "FEEDBACK": "",
                "STEPS": [{
                    "CONTENT": "5x=10"
                }, {
                    "CONTENT": "x=2"
                }],
                "PROBLEM_NUMBER": "1",
                "POSSIBLE_POINTS": 3
            }]
        },
        "jon m.": {
            "PROBLEMS": [{
                "FEEDBACK": "Watch your signs",
                "SCORE": 1.5,
                "STEPS": [{
                    "CONTENT": "5x=10"
                }, {
                    "CONTENT": "x=-2",
                    "HIGHLIGHT": "ERROR"
                }],
                "PROBLEM_NUMBER": "1",
                "POSSIBLE_POINTS": 3
            }]
        }
    };
    expect(separatedAssignments).toEqual(expectedOutput);

    var zip = new JSZip();
    for (var filename in separatedAssignments) {
        if (separatedAssignments.hasOwnProperty(filename)) {
            zip.file(filename, JSON.stringify(separatedAssignments[filename]));
        }
    }
    var content = zip.generate();
    //location.href="data:application/zip;base64," + content;
}

function testAggregateStudentWorkNoAnswerKey() {
    var allStudentWork = [ {STUDENT_FILE : "jake r.", ASSIGNMENT: [{PROBLEM_NUMBER : 1, LAST_SHOWN_STEP : 1, STEPS : [
                                { CONTENT : "5x=10"}, { CONTENT : "x=2"}]}]},
                           {STUDENT_FILE : "jon m.", ASSIGNMENT: [{PROBLEM_NUMBER : 1, LAST_SHOWN_STEP : 1, STEPS : [
                                { CONTENT : "5x=10"}, { CONTENT : "x=-2"}]}]} ];
    var expectedOutput = {
        CURRENT_FILTERS : { SIMILAR_ASSIGNMENT_GROUP_INDEX : null, ANONYMOUS : true },
        SIMILAR_ASSIGNMENT_SETS : [ ],
        PROBLEMS : { "1" : {
            POSSIBLE_POINTS : 6,
            UNIQUE_ANSWERS : [
                { ANSWER : "x=2", FILTER : SHOW_ALL, STUDENT_WORK : [ {STUDENT_FILE : "jake r.", AUTOMATICALLY_ASSIGNED_SCORE : 0, SCORE : 0, FEEDBACK : "",
                    LAST_SHOWN_STEP: 1, STEPS : [ { CONTENT : "5x=10"},{ CONTENT : "x=2"} ] } ] },
                { ANSWER : "x=-2", FILTER : SHOW_ALL, STUDENT_WORK : [ {STUDENT_FILE : "jon m.", AUTOMATICALLY_ASSIGNED_SCORE : 0, SCORE : 0, FEEDBACK : "",
                    LAST_SHOWN_STEP: 1, STEPS : [ { CONTENT : "5x=10"},{ CONTENT : "x=-2"} ] } ] } ]
        } }
    };
    expect(aggregateStudentWork(allStudentWork)).toEqual(expectedOutput);
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

/*
 * Compute a table to show the overall grades for each student
 *
 * parameters:
 * allProblems - the structure used in the redux store during grading, with
 *                     student work grouped by problem number and similar student answers
 * returns:
 *    {
 *       STUDENT_GRADES : { "student_name_from_filename" : 6, "other_student_name" : 8 },
 *       POSSIBLE_POINTS : 10,
 *    }
 */
// PROBLEMS : { "1.a" : {
//      "POSSIBLE_POINTS : 3,
//      "UNIQUE_ANSWERS" : [ { ANSWER : "x=7", FILTER : "SHOW_ALL"/"SHOW_NONE", STUDENT_WORK : [ {STUDENT_FILE : "jason", AUTOMATICALLY_ASSIGNED_SCORE : 3,
//                             STEPS : [ { CONTENT : "2x=14"},{ CONTENT : "x=7", HIGHLIGHT : SUCCESS ]} ] } } ]}
function calculateGrades(allProblems) {
    var totalPossiblePoints = 0;
    var overallGrades = {};

    for (var problemNumber in allProblems) {
        if (allProblems.hasOwnProperty(problemNumber)) {
            var possiblePoints = allProblems[problemNumber][POSSIBLE_POINTS];
            totalPossiblePoints += possiblePoints;
            var uniqueAnswers = allProblems[problemNumber][UNIQUE_ANSWERS];
            uniqueAnswers.forEach(function(allWorkWithForSingleSolution, index, arr) {
                allWorkWithForSingleSolution[STUDENT_WORK].forEach(function(singleSolution, index, arr) {
                    var studentAssignmentName = singleSolution[STUDENT_FILE];
                    var runningScore = overallGrades[studentAssignmentName];
                    runningScore = (typeof runningScore != 'undefined') ? runningScore : 0;
                    // empty string is considered ungraded, which defaults to "complete" and full credit
                    if (singleSolution[SCORE] == "") {
                        runningScore += possiblePoints;
                    } else {
                        runningScore += Number(singleSolution[SCORE]);
                    }
                    overallGrades[studentAssignmentName] = runningScore;
                });
            });
        }
    }
    return {
        STUDENT_GRADES : overallGrades,
        POSSIBLE_POINTS : totalPossiblePoints
    };
}

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

function saveAssignment() {
    var blob = new Blob([JSON.stringify({ PROBLEMS : window.store.getState()[PROBLEMS]})], {type: "text/plain;charset=utf-8"});
    saveAs(blob, window.store.getState()[ASSIGNMENT_NAME] + '.math');
}

// read a file from the local disk, pass an onChange event from a "file" input type
// http://www.htmlgoodies.com/beyond/javascript/read-text-files-using-the-javascript-filereader.html
function readSingleFile(evt, discardDataWarning) {
    //Retrieve the first (and only!) File from the FileList object
    var f = evt.target.files[0];

    if (f) {
        var r = new FileReader();
        r.onload = function(e) {
            var contents = e.target.result;
            openAssignment(contents, f.name, discardDataWarning);
        }
        r.readAsText(f);
    } else {
        alert("Failed to load file");
    }
}

// TODO - consider giving legacy docs an ID upon opening, allows auto-save to work properly when
// opening older docs
function openAssignment(serializedDoc, filename, discardDataWarning) {
    // this is now handled at a higher level, this is mostly triggered by onChange events of "file" input elements
    // if the user selects "cancel", I want them to be able to try re-opening again. If they pick the same file I
    // won't get on onChange event without resetting the value, and here I don't have a reference to the DOM element
    // to reset its value
    //if (discardDataWarning && !window.confirm("Discard your current work and open the selected document?")) {
    //    return;
    //}

    var newDoc = JSON.parse(serializedDoc);
    // compatibility for old files, need to convert the old proerty names as
    // well as add the LAST_SHOWN_STEP
    var newDoc = convertToCurrentFormat(newDoc);
    window.store.dispatch({type : SET_ASSIGNMENT_CONTENT, PROBLEMS : newDoc[PROBLEMS]});
    window.store.dispatch({type : SET_ASSIGNMENT_NAME, ASSIGNMENT_NAME : removeExtension(filename)});
}

function removeExtension(filename) {
    // remove preceding directory (for when filename comes out of the ZIP directory)
    filename = filename.replace(/[^\/]*\//, "");
    // actually remove extension
    filename = filename.replace(/\.[^/.]+$/, "");
    return filename;
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

// reducer for an individual problem
function problem(problem, action) {
    if (problem === undefined) {
        return { PROBLEM_NUMBER : "", STEPS : [{CONTENT : ""}], LAST_SHOWN_STEP : 0};
        /*
        return { PROBLEM_NUMBER : "1.1", SCORE : 3, POSSIBLE_POINTS : 3, FEEDBACK : "Nice work!", STEPS :
                [{CONTENT : "5x-2x+5-3"}, {CONTENT : "3x+5-3", HIGHLIGHT : SUCCESS}, {CONTENT : "3x+8", HIGHLIGHT : ERROR}],
                LAST_SHOWN_STEP : 2};
        */
    } else if (action.type === SET_PROBLEM_NUMBER) {
        var newNamedProb = _.clone(problem)
        newNamedProb[PROBLEM_NUMBER] = action[NEW_PROBLEM_NUMBER];
        return newNamedProb;
    } else if (action.type === EDIT_STEP) {
        return {
            ...problem,
            STEPS : [
                ...problem[STEPS].slice(0, action[STEP_KEY]),
                { CONTENT : action.NEW_STEP_CONTENT },
                ...problem[STEPS].slice(action[STEP_KEY] + 1)
            ]
        }
    } else if (action.type === NEW_STEP) {
        var editedProb = _.cloneDeep(problem);
        var oldLastStep = editedProb[STEPS][problem[LAST_SHOWN_STEP]];
        editedProb[STEPS] = editedProb[STEPS].slice(0, problem[LAST_SHOWN_STEP] + 1);
        // TODO - had a bug with edit step because this was previously just
        // adding another entry to the list with a reference to the same object
        // is it considered good practice in Redux to defensively prevent bugs
        // like this, or is it better to defer new object creation and be more thorough
        // to make sure that incorect mutations never take place?
        editedProb[STEPS].push({...oldLastStep});
        editedProb[LAST_SHOWN_STEP]++;
        return editedProb;
    } else if (action.type === UNDO_STEP) {
        if (problem[LAST_SHOWN_STEP] == 0) return problem;
        else {
            var editedProb = _.cloneDeep(problem);
            editedProb[LAST_SHOWN_STEP]--;
            return editedProb;
        }
    } else if (action.type === REDO_STEP) {
        if (problem[LAST_SHOWN_STEP] == problem[STEPS].length - 1) return problem;
        else {
            var editedProb = _.cloneDeep(problem);
            editedProb[LAST_SHOWN_STEP]++;
            return editedProb;
        }
    } else {
        return problem;
    }
}

// reducer for the list of problems in an assignment
function problems(probList, action) {
    if (probList === undefined) {
        return [ problem(undefined, action) ];
    }

    if (action.type === ADD_PROBLEM) {
        return _.clone(probList).concat(problem(undefined, action));
    } else if (action.type === REMOVE_PROBLEM) {
        return [
            ...probList.slice(0, action.PROBLEM_INDEX),
            ...probList.slice(action.PROBLEM_INDEX + 1)
        ];
    } else if (action.type === CLONE_PROBLEM) {
        var newProb = _.cloneDeep(probList[action.PROBLEM_INDEX]);
        newProb[PROBLEM_NUMBER] += ' - copy';
        return [
            ...probList.slice(0, action.PROBLEM_INDEX + 1),
            newProb,
            ...probList.slice(action.PROBLEM_INDEX + 1)
        ];
    } else if (action.type === SET_PROBLEM_NUMBER ||
               action.type === EDIT_STEP ||
               action.type === UNDO_STEP ||
               action.type === REDO_STEP ||
               action.type === NEW_STEP) {
        return [
            ...probList.slice(0, action.PROBLEM_INDEX),
            problem(probList[action.PROBLEM_INDEX], action),
            ...probList.slice(action.PROBLEM_INDEX + 1)
        ];
    } else {
        return probList;
    }
}

// reducer for an overall assignment
function assignment(state, action) {
    if (state === undefined) {
        return {
            ASSIGNMENT_NAME : UNTITLED_ASSINGMENT,
            PROBLEMS : problems(undefined, action)
            };
    } else if (action.type === SET_ASSIGNMENT_NAME) {
        state = _.cloneDeep(state);
        state.ASSIGNMENT_NAME = action.ASSIGNMENT_NAME;
        return state;
    } else {
        var new_state = _.clone(state);
        new_state[PROBLEMS] = problems(new_state[PROBLEMS], action);
        return new_state;
    }
}

function singleSolutionReducer(state, action) {
    if (action.type === GRADE_SINGLE_SOLUTION) {
        // currently no validation here
        return { ...state,
        SCORE : action[SCORE] };
	} else if (action.type === HIGHLIGHT_STEP) {
		var oldHighlight = state[STEPS][action[STEP_KEY]][HIGHLIGHT];
		var newHighlight;
		if (oldHighlight == undefined)
			newHighlight = ERROR;
		else if (oldHighlight == ERROR)
			newHighlight = SUCCESS;
		else if (oldHighlight == SUCCESS)
			newHighlight = undefined;

		var newState = { ...state,
			STEPS : [
				...state[STEPS].slice(0, action[STEP_KEY]),
				{ ...state[STEPS][action[STEP_KEY]], HIGHLIGHT : newHighlight},
				...state[STEPS].slice(action[STEP_KEY] + 1)
			]
		};
		return newState;
    } else if (action.type === SET_PROBLEM_FEEDBACK) {
        return { ...state,
        FEEDBACK : action[FEEDBACK] };
    } else if (action.type === SET_PROBLEM_POSSIBLE_POINTS) {
        var newScore = Math.round( (Number(state[SCORE])/Number(action[OLD_POSSIBLE_POINTS])) * Number(action[POSSIBLE_POINTS]));
        if (Number(state[SCORE]) > 0) {
            return { ...state,
                     SCORE : newScore };
        } else {
            return state;
        }
    } else {
        return state;
    }
}

function solutionClassReducer(state, action) {
    if (action.type === GRADE_CLASS_OF_SOLUTIONS ||
        action.type === SET_PROBLEM_POSSIBLE_POINTS) {
        var newState = { ...state };
        var workInGivenSolutionClass = [ ...state[STUDENT_WORK] ];
        if (action.type === GRADE_CLASS_OF_SOLUTIONS) {
            action.type = GRADE_SINGLE_SOLUTION;
        }
        workInGivenSolutionClass.forEach(function(singleStudentsWork, index, arr) {
            if (action[MODE] === JUST_UNGRADED && singleStudentsWork[SCORE] !== "") {
                return;
            }
            workInGivenSolutionClass[index] = singleSolutionReducer(singleStudentsWork, action);
        });
        return {
            ...state,
            STUDENT_WORK : workInGivenSolutionClass
        };
    } else if (action.type === GRADE_SINGLE_SOLUTION ||
               action.type === SET_PROBLEM_FEEDBACK ||
			   action.type === HIGHLIGHT_STEP
        ) {
        return {
            ...state,
            STUDENT_WORK : [
                ...state[STUDENT_WORK].slice(0, action[SOLUTION_INDEX]),
                singleSolutionReducer(state[STUDENT_WORK][action[SOLUTION_INDEX]], action),
                ...state[STUDENT_WORK].slice(action[SOLUTION_INDEX] + 1)
            ]
        };
    } else {
        return state;
    }
}

function problemGraderReducer(state, action) {
    if (action.type === GRADE_CLASS_OF_SOLUTIONS ||
        action.type === GRADE_SINGLE_SOLUTION ||
		action.type === HIGHLIGHT_STEP ||
        action.type === SET_PROBLEM_FEEDBACK ) {
        return {
            ...state,
            UNIQUE_ANSWERS : [
                ...state[UNIQUE_ANSWERS].slice(0, action[SOLUTION_CLASS_INDEX]),
                solutionClassReducer(state[UNIQUE_ANSWERS][action[SOLUTION_CLASS_INDEX]], action),
                ...state[UNIQUE_ANSWERS].slice(action[SOLUTION_CLASS_INDEX] + 1),
            ]
        };
        return ret;
    } else if (action.type === EDIT_POSSIBLE_POINTS) {
        return { ...state, POSSIBLE_POINTS_EDITED : action[POSSIBLE_POINTS]};
    } else if (action.type === SET_PROBLEM_POSSIBLE_POINTS) {
        // as the point values are stored at this level, must pass it down to
        // recalculate points based on new value for total possible points
        if (action.type === SET_PROBLEM_POSSIBLE_POINTS) {
            action[OLD_POSSIBLE_POINTS] = state[POSSIBLE_POINTS];
            action[POSSIBLE_POINTS] = state[POSSIBLE_POINTS_EDITED];
        }
        var newState = { ...state };
        var solutionClasses = [ ...state[UNIQUE_ANSWERS] ];
        solutionClasses.forEach(function(singleSolutionClass, index, arr) {
            solutionClasses[index] = solutionClassReducer(singleSolutionClass, action);
        });
        var ret = {
            ...state,
            UNIQUE_ANSWERS : solutionClasses
        };
        if (action.type === SET_PROBLEM_POSSIBLE_POINTS) {
            ret[POSSIBLE_POINTS] = action[POSSIBLE_POINTS];
        }
        return ret;
    } else {
        return state;
    }
}

// CURRENT_FILTERS : { SIMILAR_ASSIGNMENT_GROUP_INDEX : 1, ANONYMOUS : true/false }
// SIMILAR_ASSIGNMENT_SETS : [ [ "jason", "emma", "matt"], ["jim", "tim"] ],
// PROBLEMS : { "1.a" : {
//      "POSSIBLE_POINTS : 3,
//      "UNIQUE_ANSWERS" : [ { ANSWER : "x=7", FILTER : "SHOW_ALL"/"SHOW_NONE", STUDENT_WORK : [ {STUDENT_FILE : "jason", AUTOMATICALLY_ASSIGNED_SCORE : 3,
//                             STEPS : [ { CONTENT : "2x=14"},{ CONTENT : "x=7", HIGHLIGHT : SUCCESS ]} ] } } ]}
// reducer for teacher grading page
function grading(state, action) {
    if (state === undefined) {
        return {
            APP_MODE : GRADE_ASSIGNMENTS,
            CURRENT_FILTERS : { SIMILAR_ASSIGNMENT_GROUP_INDEX : null, ANONYMOUS : true },
            SIMILAR_ASSIGNMENT_SETS : [ ],
            PROBLEMS : { "1" : {
                POSSIBLE_POINTS : 6,
                UNIQUE_ANSWERS : [
                { ANSWER : "x=2", FILTER : SHOW_ALL, STUDENT_WORK : [
                    { STUDENT_FILE : "jake r.", AUTOMATICALLY_ASSIGNED_SCORE : 0,
                      SCORE : 0, FEEDBACK : "",
                      STEPS : [ { CONTENT : "5x=10"},{ CONTENT : "x=2"} ] },
                    { STUDENT_FILE : "alica m.", AUTOMATICALLY_ASSIGNED_SCORE : 0,
                      SCORE : 0, FEEDBACK : "",
                      STEPS : [ { CONTENT : "5x=10"},{ CONTENT : "5x=10"},{ CONTENT : "x=2"} ] }] },
                { ANSWER : "x=-2", FILTER : SHOW_ALL, STUDENT_WORK : [
                    { STUDENT_FILE : "jon m.", AUTOMATICALLY_ASSIGNED_SCORE : 0,
                      SCORE : 0, FEEDBACK : "",
                      STEPS : [ { CONTENT : "5x=10"},{ CONTENT : "x=-2"} ] } ] } ]
            } }
        };
        alert("Defualt state has not been defined for teacher grading experience");
    } else if (action.type == VIEW_SIMILAR_ASSIGNMENTS) {
        return {
            ...state,
            SIMILAR_ASSIGNMENT_GROUP_INDEX : action[SIMILAR_ASSIGNMENT_GROUP_INDEX]
        }
    } else if (action.type === SET_PROBLEM_POSSIBLE_POINTS ||
           action.type === EDIT_POSSIBLE_POINTS ||
           action.type === GRADE_CLASS_OF_SOLUTIONS ||
           action.type === GRADE_SINGLE_SOLUTION ||
           action.type === HIGHLIGHT_STEP ||
           action.type === SET_PROBLEM_FEEDBACK
    ) {
        // check if the value in the possible points input is a valid number
        if (action.type === SET_PROBLEM_POSSIBLE_POINTS) {
            if (isNaN(state[PROBLEMS][action[PROBLEM_NUMBER]][POSSIBLE_POINTS_EDITED])) {
                window.alert("Possible points must be a number");
                return state;
            }
        }
        return {
            ...state,
            PROBLEMS : {
                ...state[PROBLEMS],
                [action[PROBLEM_NUMBER]] : problemGraderReducer(state[PROBLEMS][action[PROBLEM_NUMBER]], action)
            }
        };
    } else {
        return state;
    }
}

export function rootReducer(state, action) {
    console.log(action);
    if (state === undefined || action.type == GO_TO_MODE_CHOOSER) {
        return {
            APP_MODE : MODE_CHOOSER
        };
    } else if (action.type === "NEW_ASSIGNMENT") {
        return {
            ...assignment(),
	        "DOC_ID" : Math.floor(Math.random() * 200000000),
            APP_MODE : EDIT_ASSIGNMENT
        };
    } else if (action.type === "SET_GLOBAL_STATE") {
        return action.newState;
    } else if (action.type === SET_ASSIGNMENTS_TO_GRADE) {
        // TODO - consolidate the defaults for filters
        // TODO - get similar assignment list from comparing the assignments
        // overview comes sorted by LARGEST_ANSWER_GROUPS_SIZE ascending (least number of common answers first)
        var overview = calculateGradingOverview(action[NEW_STATE][PROBLEMS]);
        return {
            ...action[NEW_STATE],
	        "DOC_ID" : Math.floor(Math.random() * 200000000),
            "GRADING_OVERVIEW" : overview,
            "CURRENT_PROBLEM" : overview[PROBLEMS][0][PROBLEM_NUMBER],
            APP_MODE : GRADE_ASSIGNMENTS,
        }
    } else if (action.type === SET_ASSIGNMENT_CONTENT) {
		// TODO - consider serializing DOC_ID and other future top level attributes into file
		// for now this prevents all opened docs from clobbering other suto-saves
        return {
            APP_MODE : EDIT_ASSIGNMENT,
            PROBLEMS : action.PROBLEMS,
	        "DOC_ID" : Math.floor(Math.random() * 200000000)
        };
    } else if (action.type === SET_TO_VIEW_GRADES) {
        // TODO - only allow this to be transitioned to from grading mode
        // also disable or hide the button when student is working on an assignment
        var grades = calculateGrades(state[PROBLEMS]);
        // leave existing entries in the state, so users can navigate back to grading
        return {
            ...state,
            GRADE_INFO : grades,
            APP_MODE : VIEW_GRADES
        };
    } else if (action.type === NAV_BACK_TO_GRADING ) {
        return {
            ...state,
            APP_MODE : GRADE_ASSIGNMENTS,
        };
    } else if (action.type === "SET_CURENT_PROBLEM") {
        return {
            ...state,
            "CURRENT_PROBLEM" : action[PROBLEM_NUMBER]
        };
    } else if (state[APP_MODE] == EDIT_ASSIGNMENT) {
        return {
            ...assignment(state, action),
            APP_MODE : EDIT_ASSIGNMENT
        }
    } else if (state[APP_MODE] == GRADE_ASSIGNMENTS) {
       return {
            ...grading(state, action),
            APP_MODE : GRADE_ASSIGNMENTS
        };
    }
}

function updateAutoSave(docType, docName, appState) {
    // TODO - validate this against actual saved data on startup
    // or possibly just re-derive it each time?
    var saveIndex = window.localStorage.getItem("save_index");
    if (saveIndex) {
        saveIndex = JSON.parse(saveIndex);
    }
    var oldDoc = undefined;
    if (!saveIndex) {
        saveIndex = { "TEACHERS" : {}, "STUDENTS" : {}};
    }
    if (saveIndex[docType][appState["DOC_ID"]]) {
        var toDelete = saveIndex[docType][appState["DOC_ID"]];
    }
    var doc = JSON.stringify(appState);
    // TODO - escape underscores (with double underscore?) in doc name, to allow splitting cleanly
    // and presenting a better name to users
    // nvm will just store a key with spaces
    var dt = new Date();
    var dateString = dt.getFullYear() + "-" + dt.getMonth() + "-" + dt.getDate() + " " + dt.getHours() +
                    ":" + dt.getMinutes() + ":" + dt.getSeconds() + "." + dt.getMilliseconds();
    var saveKey = "auto save " + docType.toLowerCase() + " " + docName + " " + dateString;
    window.localStorage.setItem(saveKey, doc);
    saveIndex[docType][appState["DOC_ID"]] = saveKey;
    window.localStorage.setItem("save_index", JSON.stringify(saveIndex));
    if (toDelete != undefined) {
        window.localStorage.removeItem(toDelete);
    }
}

function autoSave() {
    var appState = window.store.getState();

    if (appState[APP_MODE] == EDIT_ASSIGNMENT) {
        var problems = appState[PROBLEMS];
        // check for the initial state, do not save this
        if (problems.length == 1) {
            var steps = problems[0][STEPS];
            if (steps.length == 1 && steps[0][CONTENT] == '') {
                return;
            }
        }
        updateAutoSave("STUDENTS", appState["ASSIGNMENT_NAME"], appState);
    } else if (appState[APP_MODE] == GRADE_ASSIGNMENTS) {
        // TODO - add input for assignment name to teacher page
        updateAutoSave("TEACHERS", "", appState);
    } else {
        // current other states include mode chooser homepage and view grades "modal"
        return;
    }
}

var Problem = React.createClass({

    handleStepChange: function(event) {
      this.setState({value: event.target.value});
    },
    render: function() {
        var probNumber = this.props.value[PROBLEM_NUMBER];
        var problemIndex = this.props.id;
        var lastShownStep = this.props.value[LAST_SHOWN_STEP];
        var scoreClass = undefined;
        var score = this.props.value[SCORE];
        var possiblePoints = this.props.value[POSSIBLE_POINTS];
        if (score === '') {
            scoreClass = 'show-complete-div';
        } else if (score == possiblePoints) {
            scoreClass = 'show-correct-div';
        } else if (score == 0) {
            scoreClass = 'show-incorrect-div';
        } else {
            scoreClass = 'show-partially-correct-div';
        }

		var scoreMessage = null;
		if (score === '')
			scoreMessage = 'Complete';
		else if (score != undefined)
			scoreMessage = 'Score: ' + score + ' / ' + possiblePoints;
        return (
            <div className="problem-container" style={{float:'none',overflow: 'hidden'}}>
                <div style={{width:"200", height:"100%",float:"left"}}>
                    {   score != undefined ? (<div className={scoreClass}>{scoreMessage}</div>)
										   : null
                    }
                    {   this.props.value[FEEDBACK] != undefined
                            ? (<div>
                                    Feedback:<br /> {this.props.value[FEEDBACK]}
                               </div>) : null
                    }
                </div>
                <div>
                    <div>
                        Problem number <input type="text" value={probNumber} className="problem-number" onChange={
                        function(evt) { window.store.dispatch({ type : SET_PROBLEM_NUMBER, PROBLEM_INDEX : problemIndex,
                                        NEW_PROBLEM_NUMBER : evt.target.value}) }}/> &nbsp;&nbsp;&nbsp;
                        <input type="submit" value="Clone Problem"
                                        title="Make a copy of this work, useful if you need to reference it while trying another solution path." onClick={
                        function() { window.store.dispatch({ type : CLONE_PROBLEM, PROBLEM_INDEX : problemIndex}) }}/>&nbsp;&nbsp;&nbsp;
                        <input type="submit" value="x" title="Delete problem" onClick={
                        function() { if (!window.confirm("Delete problem?")) { return; }
                                     window.store.dispatch({ type : REMOVE_PROBLEM, PROBLEM_INDEX : problemIndex}) }}/>
                    </div>
                    <div style={{float:'left'}}>
                        <p> Actions </p>
                        <input type="submit" name="next step" value="Next step (Enter)" onClick={
                            function() { window.store.dispatch({ type : NEW_STEP, PROBLEM_INDEX : problemIndex}) }}/> <br/>
                        <input type="submit" name="undo step" value="Undo step" onClick={
                            function() { window.store.dispatch({ type : UNDO_STEP, PROBLEM_INDEX : problemIndex}) }}/> <br/>
                        <input type="submit" name="redo step" value="Redo step" onClick={
                            function() { window.store.dispatch({ type : REDO_STEP, PROBLEM_INDEX : problemIndex}) }}/>
                    </div>
                        <div style={{float:'left'}} className="equation-list">
                        <p> Type math here </p>
                        {
                            this.props.value[STEPS].map(function(step, stepIndex) {
                            if (stepIndex > lastShownStep) return;
                            var styles = {};
                            if (step[HIGHLIGHT] === SUCCESS) {
            					styles = {backgroundColor : GREEN };
                            } else if (step[HIGHLIGHT] === ERROR) {
            					styles = {backgroundColor : SOFT_RED};
                            }
                            return (
                            <div>
                            {/*step[CONTENT]}
                            <TeX>{step[CONTENT]}</TeX> */}
                            <MathInput key={stepIndex} buttonsVisible='focused' styles={styles}
                                       buttonSets={['trig', 'prealgebra', 'logarithms', 'calculus']} stepIndex={stepIndex}
                                       problemIndex={problemIndex} value={step[CONTENT]} onChange={
                                           function(value) {
                                            window.store.dispatch({ type : EDIT_STEP, PROBLEM_INDEX : problemIndex, STEP_KEY : stepIndex, NEW_STEP_CONTENT : value});
                                           }}
										   onSubmit={function() {
                    							window.store.dispatch(
													{ type : NEW_STEP, PROBLEM_INDEX : problemIndex});
											}}
                                       />
                            </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        );
    }
});

var Assignment = React.createClass({
    render: function() {
      var defaultEqtn = "4-9\\left({2}\\over{3}\\right)^2+\\frac{4}{5-3\\cdot 4}";
      return (
        <div id="assignment-container">
        <p>Free Math allows you to complete your math homework on your computer. The first problem has been created for you,
           use the box below to write an equation. When you want to modify it to solve your math problem click
           the "next step" button to copy your expression or equation and edit it on the next line to show your work.
           This tool is designed to take care of some of the busywork of math, which makes it easier to record all
           of your thinking without a bunch of manual copying.</p>

        <p> For example, try typing to following expression and simplifying it, even if you can do
        parts of it in your head, use the tool to make sure you show your work.&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
        </p>
        <TeX>{defaultEqtn}</TeX>

        <h3>Math editor help</h3>
        <table>
            <thead>
            <tr><th>Type this&nbsp;&nbsp;&nbsp;</th><th>Symbol</th></tr>
            </thead>
            <tbody>
            <tr><td>pi</td><td><TeX>{"\\pi"}</TeX></td></tr>
            <tr><td>sqrt</td><td><TeX>{"\\sqrt{x}"}</TeX></td></tr>
            <tr><td>int</td><td><TeX>\int</TeX></td></tr>
            <tr><td>union</td><td><TeX>\cup</TeX></td></tr>
            <tr><td>sum</td><td><TeX>{"\\sum_{ }^{ }"}</TeX></td></tr>
            <tr><td>/ (slash)</td><td><TeX>{"\\frac{a}{b}"}</TeX></td></tr>
            <tr><td>&gt;=</td><td><TeX>\ge</TeX></td></tr>
            <tr><td>&lt;=</td><td><TeX>\le</TeX></td></tr>
            <tr><td>_ (underscore)</td><td><span ref="exampleStaticMath">a_1</span>  (subscript)</td></tr>
            <tr><td>^</td><td><span ref="exampleStaticMath2">a^b</span> (superscript / power)</td></tr>
            <tr><td>\pm + [enter]</td><td><TeX>\pm</TeX></td></tr>
            </tbody>
        </table>

        <div>
        {this.props.value[PROBLEMS].map(function(problem, problemIndex) {
            return (
              <Problem value={problem} key={problemIndex} id={problemIndex}/>
            );
        })}
        </div>
        <button onClick={function() { window.store.dispatch({ type : ADD_PROBLEM}); }}>Add Problem</button>
        </div>
      )
    },

    componentDidMount: function() {
        MathQuill.StaticMath(ReactDOM.findDOMNode(this.refs.exampleStaticMath));
        MathQuill.StaticMath(ReactDOM.findDOMNode(this.refs.exampleStaticMath2));
    }
    ,
});

// A problem grader encompasses all of the student work in response
// to a single problem. The work is grouped by similar final answer,
// the groups are called "answer classes".
var ProblemGrader = React.createClass({
    render: function() {
        var problemNumber = this.props.problemNumber;
        var studentsToView = this.props.studentsToView;
        var problemInfo = this.props.problemInfo;
        var possiblePoints = problemInfo[POSSIBLE_POINTS];
        var totalIncorrect = "TODO";
        var possiblePoints = problemInfo[POSSIBLE_POINTS_EDITED] != undefined ? problemInfo[POSSIBLE_POINTS_EDITED] : problemInfo[POSSIBLE_POINTS];
        var oldPossiblePoints = problemInfo[POSSIBLE_POINTS];
        return (
            <div className="problem-summary-container" style={{float:"none",overflow:"hidden"}}>
                <h3>Problem number {problemNumber}</h3>
                {/*<p>Total incorrect answers {totalIncorrect}</p>*/}
                <p>Possible points &nbsp;<input type="text" className="possible-points-input" width="4" value={possiblePoints} onChange={
                                function(evt) { window.store.dispatch({
                                    type : EDIT_POSSIBLE_POINTS, PROBLEM_NUMBER : problemNumber,
                                    POSSIBLE_POINTS : evt.target.value
                                    }) }}
                                />
                    <input type="submit" name="apply new possible score" value="Apply" onClick={
                        function() { window.store.dispatch({ type : SET_PROBLEM_POSSIBLE_POINTS, PROBLEM_NUMBER : problemNumber}) }}/> <br/>
                            </p>
                {
                    problemInfo[UNIQUE_ANSWERS].map(function(solutionClassInfo, solutionClassIndex) {
                        return (
                            <SolutionClassGrader solutionClassInfo={solutionClassInfo} key={solutionClassIndex}
                                                 solutionClassIndex={solutionClassIndex} problemNumber={problemNumber}
                                                 possiblePoints={oldPossiblePoints} studentsToView={studentsToView}/>

                        );
                    })
                }
            </div>);
    }
});

var TeacherInteractiveGrader = React.createClass({
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
        var chart;
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
		chart = new Chart(this.chart.getContext('2d'), {
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
            	<canvas ref={(input) => { this.chart = input }} width="400" height="50"></canvas>
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

var SolutionClassGrader = React.createClass({
    render: function() {
        // TODO - finish
        var data = this.props.solutionClassInfo;
        var studentsToView = this.props.studentsToView;
        // TODO - finish
        var solutionClassIndex = this.props.solutionClassIndex;
        var problemNumber = this.props.problemNumber;
        var possiblePoints = this.props.possiblePoints;
        var studentFinalAnswer = data[ANSWER];
        var studentCount = _.size(data[STUDENT_WORK]);
        if (studentCount > 1) {
            studentCount = studentCount + ' students ';
        } else {
            studentCount = studentCount + ' student ';
        }
        var message = 'with work leading to answer ';
        if (studentFinalAnswer === 'unanswered') {
           message = 'with the question ';
        }
        // due to filtering there may be no answers showing in this group, in this case render nothing
        // not even the header
        var anyAnswersShowing = false;
        data[STUDENT_WORK].map(function(studentSolution, studentSolutionIndex) {
            if (studentsToView == undefined || !studentsToView || studentsToView.includes(studentSolution[STUDENT_FILE])) {
                anyAnswersShowing = true;
            }
        });
        return (
            <div>
            { !anyAnswersShowing ? null :
            (<div className="similar-student-answers" style={{float:"none",overflow:"hidden"}} >
                {/*<input type="submit" className="show-all-common-answers" name="show all" value="show all"/>*/}
                {/*<input type="submit" className="hide-all-common-answers" name="hide all" value="hide all"/>*/}
                <p> {studentCount}{message}</p>
                <TeX>{studentFinalAnswer}</TeX>
                {
                    data[STUDENT_WORK].map(function(studentSolution, studentSolutionIndex) {
                        if (studentsToView == undefined || !studentsToView || studentsToView.includes(studentSolution[STUDENT_FILE])) {
                            return (<SolutionGrader solutionGradeInfo={studentSolution} problemNumber={problemNumber} possiblePoints={possiblePoints}
                                                key={studentSolutionIndex} id={studentSolutionIndex} solutionClassIndex={solutionClassIndex}/>)
                        } else {
                            return null;
                        }
                    })
                }
            </div>)
            }
            </div>
        );
    }
});

var SolutionGrader = React.createClass({
    setScore: function(evt) {
        var problemNumber = this.props.problemNumber
        var solutionClassIndex = this.props.solutionClassIndex;
        var studentSolutionIndex = this.props.id;
        window.store.dispatch({ type : GRADE_SINGLE_SOLUTION, PROBLEM_NUMBER : problemNumber,
                         SOLUTION_CLASS_INDEX : solutionClassIndex, SCORE : evt.target.value, SOLUTION_INDEX : studentSolutionIndex});
    },
    fullPoints: function(evt) {
        var problemNumber = this.props.problemNumber
        var solutionClassIndex = this.props.solutionClassIndex;
        var studentSolutionIndex = this.props.id;
        window.store.dispatch({ type : GRADE_SINGLE_SOLUTION, PROBLEM_NUMBER : problemNumber,
                         SOLUTION_CLASS_INDEX : solutionClassIndex, SCORE : this.props.possiblePoints, SOLUTION_INDEX : studentSolutionIndex});
    },
    applyScoreToAll: function(evt) {
        var data = this.props.solutionGradeInfo;
        var problemNumber = this.props.problemNumber;
        var solutionClassIndex = this.props.solutionClassIndex;
        // TODO - check if any unique grades have been applied to student solutions other than this one in
        // this solution class
        // if not, just send the action through, otherwise prompt a warning about losing grades
        // this is to prevent loss of work if a teacher already gave specific grades to a
        // few students, it is necessary to have this feature to allow re-grading a whole group
        // which is not possible with "apply to ungraded"
        // TODO - inside of this component I shouldn't really know about all of the other solutions
        // in this group, as this is just rendering a single problems grader. Could pass down callback
        // that doesn't expose the data completely but just allows this check to be made

        window.store.dispatch({ type : GRADE_CLASS_OF_SOLUTIONS, MODE : ALL, PROBLEM_NUMBER : problemNumber,
                         SOLUTION_CLASS_INDEX : solutionClassIndex, SCORE : data[SCORE]});
    },
    applyScoreToUngraded: function(evt) {
        var data = this.props.solutionGradeInfo;
        var problemNumber = this.props.problemNumber;
        var solutionClassIndex = this.props.solutionClassIndex;
        window.store.dispatch({ type : GRADE_CLASS_OF_SOLUTIONS, MODE : JUST_UNGRADED, PROBLEM_NUMBER : problemNumber,
                         SOLUTION_CLASS_INDEX : solutionClassIndex, SCORE : data[SCORE]});
    },
    setFeedback: function(evt) {
        var problemNumber = this.props.problemNumber
        var solutionClassIndex = this.props.solutionClassIndex;
        var studentSolutionIndex = this.props.id;
        window.store.dispatch({ type : SET_PROBLEM_FEEDBACK, PROBLEM_NUMBER : problemNumber,
                         SOLUTION_CLASS_INDEX : solutionClassIndex, FEEDBACK : evt.target.value, SOLUTION_INDEX : studentSolutionIndex});
    },
    setQuickFeedback: function(text) {
        var problemNumber = this.props.problemNumber
        var solutionClassIndex = this.props.solutionClassIndex;
        var studentSolutionIndex = this.props.id;
        window.store.dispatch({ type : SET_PROBLEM_FEEDBACK, PROBLEM_NUMBER : problemNumber,
                         SOLUTION_CLASS_INDEX : solutionClassIndex, FEEDBACK : text, SOLUTION_INDEX : studentSolutionIndex});
    },
    render: function() {
        var data = this.props.solutionGradeInfo;
        var problemNumber = this.props.problemNumber
        var possiblePoints = this.props.possiblePoints;
        var solutionClassIndex = this.props.solutionClassIndex;
        var studentSolutionIndex = this.props.id;
        //var showStudentName = this.props.showStudentName;
        var showStudentName = true;
        var correctness;
        // TODO - look up react/redux best practices with stuff like this
        // keep possiblePoints as a string in the model to allow it to be
        // empty string while editing the text
        var score = Number(data[SCORE]);
        var feedback = data[FEEDBACK];
        // TODO - replace with classNames library - https://github.com/JedWatson/classnames
        // or computed inline styles, sharing through explicit imports/passing down
        var possiblePointsNum = Number(possiblePoints);
        // TODO - consider if empty string is the best way to convey "not yet scored"/complete
        if (data[SCORE] === "") {
            correctness = "answer-complete";
        } else if (score == 0) {
            correctness = "answer-incorrect";
        } else if (score >= possiblePointsNum) {
            correctness = "answer-correct";
        } else {
            correctness = "answer-partially-correct";
        }
        var classes = "student-work " + correctness;
        return (
            <div className={classes} style={{float:"left"}}> {/*<!-- container for nav an equation list --> */}
                { data[SCORE] === "" ? (<div><span style={{color:"#545454"}}>Complete - Full Credit</span></div>) : null }
                <p className="student-name-label"> {showStudentName ? data[STUDENT_FILE] : "" }</p>
                {/* TODO - I need teachers to be able to edit the score, including deleting down to empty string, so they
                           can write a new score. If I add validation when setting the value in the reducer the field won't be editable.
                           Look up react best pratices for this, right now I'll assume I should attach another event here to ensure
                           that the field contains a number when focus is lost
                */}
                <p>Score <input type="text" className="problem-grade-input" value={data[SCORE]} onChange={this.setScore}
                          /> out of {possiblePoints}
                        <input type="submit" value="Full points" onClick={this.fullPoints}/>
                        <input type="submit" name="apply score to all" value="Apply to ungraded" onClick={this.applyScoreToUngraded}/>
                        <input type="submit" name="apply score to all" value="Apply to all" onClick={this.applyScoreToAll}/>
                </p>
                <p>Feedback &nbsp; &nbsp;
                <input type="submit" value="Show work" onClick={function() {this.setQuickFeedback("Show your complete work.");}.bind(this)}/>
                <input type="submit" value="Simple mistake" onClick={function() {this.setQuickFeedback("Review your work for a simple mistake.")}.bind(this)}/>
                <input type="submit" value="Let's talk" onClick={function() {this.setQuickFeedback("Let's chat about this next class.");}.bind(this)}/>
                <input type="submit" value="Not simplified" onClick={function() {this.setQuickFeedback("Be sure to simplify completely.");}.bind(this)}/>
                <input type="submit" value="Sig figs" onClick={function() {this.setQuickFeedback("Incorrect significant figures.");}.bind(this)}/>
                </p>

                <div><textarea width="30" height="8" onChange={this.setFeedback} value={feedback}></textarea>
                </div>
                <div style={{float:"left"}} className="equation-list">
                    <br/>
                    {
                        data[STEPS].map(function(step, stepIndex) {
        				var stepStyle = {};
						if (step[HIGHLIGHT] == ERROR) stepStyle = {backgroundColor : RED}
						else if (step[HIGHLIGHT] == SUCCESS) stepStyle = {backgroundColor : GREEN}

                        return (
                            <div key={stepIndex + ' ' + step[HIGHLIGHT]}>
                                <TeX style={stepStyle} onClick={function() {
									window.store.dispatch({ type : HIGHLIGHT_STEP, PROBLEM_NUMBER : problemNumber,
													SOLUTION_CLASS_INDEX : solutionClassIndex,
													SOLUTION_INDEX : studentSolutionIndex,
													STEP_KEY : stepIndex});
        							}}>{step[CONTENT]}</TeX> <br/><br/>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    }
});

// TODO FINISH SETTING TO GRADE ANAONYMOUSLY
var TeacherGraderFilters = React.createClass({
    render: function() {
        return (
        <div className="assignment-filters">
            <h3>Grading Settings</h3>
            <div><label><input type="checkbox" id="show-student-names" checked="checked"/>&nbsp;&nbsp;
                    Show student names (or grade anonymously)</label>
            </div>
        </div>
        );
    }
});

var LogoHomeNav = React.createClass({
  render: function() {
        return (
            <div style={{float:"left","margin":"0px 15px 0px 15px"}} onClick= {
                function(evt) {
                    if (!window.confirm("Are you sure you want to leave your current work?")) {
                        return;
                    }
                    window.store.dispatch({type : "GO_TO_MODE_CHOOSER"});

                    // temporarily disable data loss warning
                    setTimeout(function() { window.onbeforeunload = null;}, 500);
                }}
            >
            <h2 style={{"display":"inline","fontFamily":"serif"}}>
                <b>Free Math</b>
            </h2>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            <h3 style={{"color" : "#3abfc7","display":"inline","fontFamily":"serif"}}>
                <b>Beta</b>
            </h3>
            <br />
            <span style={{"fontSize": 11}}>Free your mind, learn and discover faster.</span>
            </div>
            );
  }
});


var AssignmentEditorMenubar = React.createClass({
  render: function() {
        return (
            <div className="menuBar">
                <div className="nav">
                    <LogoHomeNav /> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;

                    <div style={{"verticalAlign":"bottom"}}>
                        Assignment and Student Name &nbsp;&nbsp;&nbsp;
                        <input type="text" id="assignment-name-text" name="assignment name" value={this.props.value[ASSIGNMENT_NAME]} onChange={
                            function(evt) {
                                window.store.dispatch({type : SET_ASSIGNMENT_NAME, ASSIGNMENT_NAME : evt.target.value});
                            }}
                        />&nbsp;&nbsp;&nbsp;

                        <input type="submit" id="save-assignment" name="save assignment" value="save assignment" onClick={
                            function() { saveAssignment() }} /> &nbsp;&nbsp;&nbsp;
                            Open Assignment <input type="file"  ref={(input) => { this.fileInput = input; }} id="open-file-input" onChange={
                            function(evt) {
                                if (!window.confirm("Are you sure you want to leave your current work?")) {
                                    evt.target.value = "";
                                    return;
                                }
                                readSingleFile(evt, true /* warn about data loss */);
                                evt.target.value = "";
                            }}/>
                        <input type="submit" id="new-assignment" name="New assignment" value="New assignment" onClick={
                        function() {
                            if (!window.confirm("Are you sure you want to leave your current work and start a new document?")) {
                                return;
                            }
                            window.store.dispatch({type : "NEW_ASSIGNMENT"});
                        }}/>
                    </div>
                </div>
            </div>
        );
  }
});

var GradingMenuBar = React.createClass({
    render: function() {
        return (
            <div className="menuBar">
                <div className="nav">
                    <LogoHomeNav /> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                    <div style={{"verticalAlign":"bottom"}}>
                        Grade Student Assignments <input type="file" id="open-student-submissions-input" onChange={
                            function(evt){
                                if (!window.confirm("Are you sure you want to leave your current work?")) {
                                    evt.target.value = "";
                                    return;
                                }
                                studentSubmissionsZip(evt);
                                evt.target.value = "";
                            }
                        }/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                        <input type="submit" id="save-graded-assignments" value="Save graded" onClick={
                            function() {
                                saveGradedStudentWork(window.store.getState());
                            }
                        }/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                        <input type="submit" id="view-grades" value="View grades" onClick={
                            function() {window.store.dispatch({type : SET_TO_VIEW_GRADES})}
                        }/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                        <input type="submit" id="scroll-to-top" value="Scroll to top" onClick={
                            function() {
                                window.location.hash = '';
                                document.body.scrollTop = document.documentElement.scrollTop = 0;}
                        }/>
                    </div>
                </div>
            </div>
        );
    }
});

var ModalWhileGradingMenuBar = React.createClass({
    render: function() {
        return (
            <div className="menuBar">
                <div className="nav">
                    <LogoHomeNav /> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                    <div style={{"verticalAlign":"bottom"}}>
                        <input type="submit" id="back-to-grading" value="Back to grading" onClick={
                            function() {window.store.dispatch({type : NAV_BACK_TO_GRADING})}
                        }/>
                    </div>
                </div>
            </div>
        );
    }
});

var DefaultHomepageActions = React.createClass({
    render: function() {
        var divStyle = {
            width:"42%",
            float: "left",
            borderRadius:"3px",
            border:"1px solid #cfcfcf",
            backgroundColor:"white",
            margin:"0px 15px 15px 15px",
            padding:"0px 15px 15px 15px"
        };
        var wrapperDivStyle = {
            padding:"30px 30px 0px 30px",
            "backgroundColor":"#fafafa",
            "margin-left":"auto",
            "margin-right": "auto",
            width:"1024"
        };

        var recoverAutoSaveCallback = function(docName) {
            // turn on confirmation dialog upon navigation away
            window.onbeforeunload = function() {
                    return true;
            };
            var recovered = JSON.parse(window.localStorage.getItem(docName));
            window.store.dispatch({"type" : "SET_GLOBAL_STATE", "newState" : recovered });
        };
        var deleteAutoSaveCallback = function(docName) {
            if (!window.confirm("Are you sure you want to delete this recovered document?")) {
                return;
            }
            window.localStorage.removeItem(docName);
            // TODO - fix this hack, should not explicitly call render, this should be fixed while
            // addressing TODO below about component directly accessing localStorage
            render();
        };
        // TODO - this is ugly, a component shouldn't access localStorage, this should be read in at app startup
        // stored in the redux state tree and then kept in sync with what is actually stored through actions
        // use subscribers - https://stackoverflow.com/questions/35305661/where-to-write-to-localstorage-in-a-redux-app
        var recoveredStudentDocs = [];
        var recoveredTeacherDocs = [];
        // recovered autoSaved docs
        for (var key in localStorage){
            if (key.startsWith("auto save students")) {
                recoveredStudentDocs.push(key);
            } else if (key.startsWith("auto save teachers")) {
                recoveredTeacherDocs.push(key);
            }
        }
        return (
            <div style={wrapperDivStyle}>
                <div style={{display:"inline-block", width:"100%"}}>
                    <div>
                        <div style={divStyle}>
                            <h3>Students</h3>
                                New Assignment &nbsp;&nbsp;&nbsp;
                                <input type="submit" id="new-assignment" name="New assignment" value="Create" onClick={
                                    function() {
                                        // turn on confirmation dialog upon navigation away
                                        window.onbeforeunload = function() {
                                                return true;
                                        };
                                        window.store.dispatch({type : "NEW_ASSIGNMENT"});
                                }}/><br />

                                Open Assignment &nbsp;&nbsp;&nbsp;
                                <input type="file" id="open-file-input" onChange={
                                    function(evt) {
                                        // turn on confirmation dialog upon navigation away
                                        window.onbeforeunload = function() {
                                                return true;
                                        };
                                        readSingleFile(evt, false /* don't warn about data loss */);
                                }}/>
                                { (recoveredStudentDocs.length > 0) ? (<h4>Recovered assignments:</h4>) : null }
                                { (recoveredStudentDocs.length > 0) ?

                                        recoveredStudentDocs.map(function(docName, docIndex) {
                                            return (
                                                <div key={docName}><input type="submit" value="open" onClick={function() {recoverAutoSaveCallback(docName)}} />
                                                     <input type="submit" value="delete" onClick={function() {deleteAutoSaveCallback(docName)}} />

                                                {docName.replace("auto save students ","")}</div>
                                            );
                                        })
                                   : null
                                }
                                { (recoveredStudentDocs.length > 0) ? (<p>Recovered assignments stored temporarily in your browser, save to your device as soon as possible</p>) : null }
                        </div>
                        <div style={divStyle}>
                            <h3>Teachers</h3>
                            Grade Student Assignments <input type="file" id="open-student-submissions-input" onChange={
                                function(evt){
                                    // turn on confirmation dialog upon navigation away
                                    window.onbeforeunload = function() {
                                            return true;
                                    };
                                    studentSubmissionsZip(evt);
                                }
                            }/>
                            { (recoveredTeacherDocs.length > 0) ? (<h4>Recovered grading sessions:</h4>) : null }
                            { (recoveredTeacherDocs.length > 0) ?

                                    recoveredTeacherDocs.map(function(docName, docIndex) {
                                        return (
                                            <div key={docName}><input type="submit" value="open" onClick={function() {recoverAutoSaveCallback(docName)}} />
                                                 <input type="submit" value="delete" onClick={function() {deleteAutoSaveCallback(docName)}} />
                                            {docName.replace("auto save teachers ","")}</div>
                                        );
                                    })
                               : null
                            }
                            { (recoveredTeacherDocs.length > 0) ? (<p>Recovered grading sessions stored temporarily in your browser, save to your device as soon as possible</p>) : null }
                            <p><a href="student_submissions.zip">Download Example Assignments To Test Grading</a></p>
                        </div>
                    </div>
                </div>
                <div style={{position:"relative",height:"0","padding-bottom":"56.25%"}}><iframe src="https://www.youtube.com/embed/vB7KCDeBYpI?ecver=2" width="640" height="360" frameborder="0" gesture="media" style={{position:"absolute",width:"100%",height:"100%",left:0}} allowfullscreen></iframe></div>
                <br />
                <h1>Meet Your New Math Classroom</h1>
                <p>Students digitally record step-by-step math work.</p>
                <p>No account setup required, free for teachers and students. Work saves as files on your local device, share docs through your existing course management solution.</p>
                <p>Teachers load all students docs for simultaneous grading, reviewing complete solutions grouped by similar final answer.</p>
                <p>Provide targeted feedback before a test or quiz and improve daily communication with students.</p>
                <p>The software is released under the terms of the Open Source GNU General Public License. <a href="https://github.com/jaltekruse/Free-Math">Source Code</a></p>
                <h2>Contact the Developer</h2>
                <p>I am currently looking for classes to pilot the software, if you would like to discuss how you could use Free Math in your classroom send me a message to this address. Bug reports, questions and press inquries can also be directed to this address.</p>
                <p>developers@freemathapp.org</p>
                <div>Follow the project <a href="https://www.facebook.com/freemathapp"><img alt="facebook" src="FreeMathOld/images/facebook.png" style={{height:"35px"}}></img></a>
                    <a href="https://twitter.com/freemathapp"><img alt="twitter" src="FreeMathOld/images/twitter.png" style={{height:"35px"}}></img></a>
    <a href="https://github.com/jaltekruse/Free-Math/issues">Report Bug or Request Feature</a>
    </div>
                <h2>Supported Platforms</h2>
                <p>
                Modern browsers on Chromebooks, Windows, Mac and Linux. <br />
                Android and iOS are currently unsupported, but some devices may work.
                </p>
                <h3>Legal</h3>
                <small>
                Free Math is free software: you can redistribute it and/or modify
                it under the terms of the GNU General Public License as published by
                the Free Software Foundation, either version 3 of the License, or
                (at your option) any later version.

                Free Math is distributed in the hope that it will be useful,
                but WITHOUT ANY WARRANTY; without even the implied warranty of
                MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
                GNU General Public License for more details.

                You should have received a copy of the GNU General Public License
                along with Free Math.  If not, see &lt;http://www.gnu.org/licenses/&gt;.
                </small>
            </div>
        );
    }
})

var FreeMath = React.createClass({
  render: function() {
    // TODO - figure out how to best switch between teacher and
    // student mode rendering
    var wrapperDivStyle = {
        padding:"30px 30px 0px 30px",
        "backgroundColor":"#fafafa",
        "margin-left":"auto",
        "margin-right": "auto",
        width:"1024",
        height:"100%"
    };
    if (this.props.value[APP_MODE] === EDIT_ASSIGNMENT) {
        return (
            <div style={wrapperDivStyle}>
                <AssignmentEditorMenubar value={this.props.value}/>
                <div style={{display:"inline-block", width:"100%"}}>
                    <Assignment value={this.props.value}/>
                </div>
            </div>
        );
    } else if (this.props.value[APP_MODE] === GRADE_ASSIGNMENTS) {
        return (
            <div style={{...wrapperDivStyle, width : "95%" }}>
                <GradingMenuBar />
                <TeacherInteractiveGrader value={this.props.value}/>
            </div>
        );
    } else if (this.props.value[APP_MODE] === MODE_CHOOSER) {
        return (
        <div>
            <div className="menuBar">
                <div className="nav">
                    <LogoHomeNav />
                </div>
            </div>
            <DefaultHomepageActions />
        </div>
        );
    } else if (this.props.value[APP_MODE] === VIEW_GRADES) {
        var props = this.props;
        return (
            <div>
                <ModalWhileGradingMenuBar />
                <table>
                    <thead>
                    <tr><th>Student File</th><th>Score</th></tr>
                    </thead>
                    <tbody>
                    {
                        function() {
                            var tableRows = [];
                            var grades = props.value[GRADE_INFO][STUDENT_GRADES];
                            for (var studentFileName in grades) {
                                if (grades.hasOwnProperty(studentFileName)) {
                                    tableRows.push(
                                    (<tr><td>{studentFileName}</td><td>{grades[studentFileName]}</td></tr> ));
                                }
                            }
                            return tableRows;
                        }()
                    }
                    </tbody>
                </table>
            </div>
        );
    } else  {
        alert(this.props.value);
    }
  }
});

export function render() {
    autoSave();
    ReactDOM.render(
        <FreeMath value={window.store.getState()} />,
        document.getElementById('root')
    );
}

// in the teacher grading experince, student work is grouped by similar final answer
// these groups are called solution classes
function testGradeSolutionClass() {

    var input = {
        CURRENT_FILTERS : { SIMILAR_ASSIGNMENT_GROUP_INDEX : null, ANONYMOUS : true },
        SIMILAR_ASSIGNMENT_SETS : [ ],
        PROBLEMS : { "1" : {
            POSSIBLE_POINTS : 6,
            UNIQUE_ANSWERS : [
            { ANSWER : "x=2", FILTER : SHOW_ALL, STUDENT_WORK : [
                { STUDENT_FILE : "jake r.", AUTOMATICALLY_ASSIGNED_SCORE : 0,
                  SCORE : 0, FEEDBACK : "",
                  STEPS : [ { CONTENT : "5x=10"},{ CONTENT : "x=2"} ] },
                { STUDENT_FILE : "alica m.", AUTOMATICALLY_ASSIGNED_SCORE : 0,
                  SCORE : 0, FEEDBACK : "",
                  STEPS : [ { CONTENT : "5x=10"},{ CONTENT : "5x=10"},{ CONTENT : "x=2"} ] }] },
            { ANSWER : "x=-2", FILTER : SHOW_ALL, STUDENT_WORK : [
                { STUDENT_FILE : "jon m.", AUTOMATICALLY_ASSIGNED_SCORE : 0,
                  SCORE : 0, FEEDBACK : "",
                  STEPS : [ { CONTENT : "5x=10"},{ CONTENT : "x=-2"} ] } ] } ]
        } }
    };
    var expectedOutput = {
        CURRENT_FILTERS : { SIMILAR_ASSIGNMENT_GROUP_INDEX : null, ANONYMOUS : true },
        SIMILAR_ASSIGNMENT_SETS : [ ],
        PROBLEMS : { "1" : {
            POSSIBLE_POINTS : 6,
            UNIQUE_ANSWERS : [
                { ANSWER : "x=2", FILTER : SHOW_ALL, STUDENT_WORK : [
                    {STUDENT_FILE : "jake r.", AUTOMATICALLY_ASSIGNED_SCORE : 0, SCORE : 3, FEEDBACK : "", STEPS : [ { CONTENT : "5x=10"},{ CONTENT : "x=2"} ] },
                    {STUDENT_FILE : "alica m.", AUTOMATICALLY_ASSIGNED_SCORE : 0, SCORE : 3, FEEDBACK : "", STEPS : [
                        { CONTENT : "5x=10"},{ CONTENT : "5x=10"},{ CONTENT : "x=2"}
                        ] }
                ] },
                { ANSWER : "x=-2", FILTER : SHOW_ALL, STUDENT_WORK : [ {STUDENT_FILE : "jon m.", AUTOMATICALLY_ASSIGNED_SCORE : 0, SCORE : 0, FEEDBACK : "",
                    STEPS : [ { CONTENT : "5x=10"},{ CONTENT : "x=-2"} ] } ] } ]
        } }
    };
    deepFreeze(input);
    var output = grading(input, { type : GRADE_CLASS_OF_SOLUTIONS, PROBLEM_NUMBER : "1", SOLUTION_CLASS_INDEX : 0, SCORE : 3} );
    expect(output).toEqual(expectedOutput);
}


function testGradeSingleSolution() {
    var input = {
        CURRENT_FILTERS : { SIMILAR_ASSIGNMENT_GROUP_INDEX : null, ANONYMOUS : true },
        SIMILAR_ASSIGNMENT_SETS : [ ],
        PROBLEMS : { "1" : {
            POSSIBLE_POINTS : 6,
            UNIQUE_ANSWERS : [
            { ANSWER : "x=2", FILTER : SHOW_ALL, STUDENT_WORK : [
                { STUDENT_FILE : "jake r.", AUTOMATICALLY_ASSIGNED_SCORE : 0,
                  SCORE : 0, FEEDBACK : "",
                  STEPS : [ { CONTENT : "5x=10"},{ CONTENT : "x=2"} ] },
                { STUDENT_FILE : "alica m.", AUTOMATICALLY_ASSIGNED_SCORE : 0,
                  SCORE : 0, FEEDBACK : "",
                  STEPS : [ { CONTENT : "5x=10"},{ CONTENT : "5x=10"},{ CONTENT : "x=2"} ] }] },
            { ANSWER : "x=-2", FILTER : SHOW_ALL, STUDENT_WORK : [
                { STUDENT_FILE : "jon m.", AUTOMATICALLY_ASSIGNED_SCORE : 0,
                  SCORE : 0, FEEDBACK : "",
                  STEPS : [ { CONTENT : "5x=10"},{ CONTENT : "x=-2"} ] } ] } ]
        } }
    };
    var expectedOutput = {
        CURRENT_FILTERS : { SIMILAR_ASSIGNMENT_GROUP_INDEX : null, ANONYMOUS : true },
        SIMILAR_ASSIGNMENT_SETS : [ ],
        PROBLEMS : { "1" : {
            POSSIBLE_POINTS : 6,
            UNIQUE_ANSWERS : [
                { ANSWER : "x=2", FILTER : SHOW_ALL, STUDENT_WORK : [
                    {STUDENT_FILE : "jake r.", AUTOMATICALLY_ASSIGNED_SCORE : 0, SCORE : 3, FEEDBACK : "", STEPS : [ { CONTENT : "5x=10"},{ CONTENT : "x=2"} ] },
                    {STUDENT_FILE : "alica m.", AUTOMATICALLY_ASSIGNED_SCORE : 0, SCORE : 0, FEEDBACK : "", STEPS : [
                        { CONTENT : "5x=10"},{ CONTENT : "5x=10"},{ CONTENT : "x=2"}
                        ] }
                ] },
                { ANSWER : "x=-2", FILTER : SHOW_ALL, STUDENT_WORK : [ {STUDENT_FILE : "jon m.", AUTOMATICALLY_ASSIGNED_SCORE : 0, SCORE : 0, FEEDBACK : "",
                    STEPS : [ { CONTENT : "5x=10"},{ CONTENT : "x=-2"} ] } ] } ]
        } }
    };
    deepFreeze(input);
    var output = grading(input, { type : GRADE_SINGLE_SOLUTION, PROBLEM_NUMBER : "1", SOLUTION_CLASS_INDEX : 0, SCORE : 3, SOLUTION_INDEX : 0} );
    expect(output).toEqual(expectedOutput);
}

function testAddProblem() {
    var initialAssignment = {
        APP_MODE : EDIT_ASSIGNMENT,
        ASSIGNMENT_NAME : UNTITLED_ASSINGMENT,
        PROBLEMS : [ { PROBLEM_NUMBER : "1", STEPS : [{CONTENT : "1+2"}, {CONTENT : "3"}], LAST_SHOWN_STEP : 0 },
                     { PROBLEM_NUMBER : "2", STEPS : [{CONTENT : "4-2"}, {CONTENT : "2"}], LAST_SHOWN_STEP : 0 }
        ]
    }
    var expectedAssignment = {
        APP_MODE : EDIT_ASSIGNMENT,
        ASSIGNMENT_NAME : UNTITLED_ASSINGMENT,
        PROBLEMS : [ { PROBLEM_NUMBER : "1", STEPS : [{CONTENT : "1+2"}, {CONTENT : "3"}], LAST_SHOWN_STEP : 0 },
                     { PROBLEM_NUMBER : "2", STEPS : [{CONTENT : "4-2"}, {CONTENT : "2"}], LAST_SHOWN_STEP : 0 },
                     { PROBLEM_NUMBER : "", STEPS : [{CONTENT : ""}], LAST_SHOWN_STEP : 0 }
        ]

    }
    deepFreeze(initialAssignment);
    expect(
        assignment(initialAssignment, { type : ADD_PROBLEM })
    ).toEqual(expectedAssignment);
}

function testRemoveProblem() {
    var initialAssignment = {
        APP_MODE : EDIT_ASSIGNMENT,
        ASSIGNMENT_NAME : UNTITLED_ASSINGMENT,
        PROBLEMS : [ { PROBLEM_NUMBER : "1", STEPS : [{CONTNENT : "1+2"},{CONTENT : "3"}], LAST_SHOWN_STEP : 1},
                     { PROBLEM_NUMBER : "2", STEPS : [{CONTENT : "4-2"}, {CONTENT : "2"}], LAST_SHOWN_STEP : 1}
        ]
    }
    var expectedAssignment = {
        APP_MODE : EDIT_ASSIGNMENT,
        ASSIGNMENT_NAME : UNTITLED_ASSINGMENT,
        PROBLEMS : [ { PROBLEM_NUMBER : "1", STEPS : [{CONTNENT : "1+2"},{CONTENT : "3"}], LAST_SHOWN_STEP : 1} ]
    }
    deepFreeze(initialAssignment);
    expect(
        assignment(initialAssignment, { type : REMOVE_PROBLEM, PROBLEM_INDEX : 1 })
    ).toEqual(expectedAssignment);
    }

function testCloneProblem() {
    var initialAssignment = {
        APP_MODE : EDIT_ASSIGNMENT,
        ASSIGNMENT_NAME : UNTITLED_ASSINGMENT,
        PROBLEMS : [ { PROBLEM_NUMBER : "1", STEPS : [{CONTNENT : "1+2"},{CONTENT : "3"}], LAST_SHOWN_STEP : 1},
                     { PROBLEM_NUMBER : "2", STEPS : [{CONTENT : "4-2"}, {CONTENT : "2"}], LAST_SHOWN_STEP : 1}
        ]
    }
    var expectedAssignment = {
        APP_MODE : EDIT_ASSIGNMENT,
        ASSIGNMENT_NAME : UNTITLED_ASSINGMENT,
        PROBLEMS : [ { PROBLEM_NUMBER : "1", STEPS : [{CONTNENT : "1+2"},{CONTENT : "3"}], LAST_SHOWN_STEP : 1},
                     { PROBLEM_NUMBER : "1 - copy", STEPS : [{CONTNENT : "1+2"},{CONTENT : "3"}], LAST_SHOWN_STEP : 1},
                     { PROBLEM_NUMBER : "2", STEPS : [{CONTENT : "4-2"}, {CONTENT : "2"}], LAST_SHOWN_STEP : 1}
        ]
    }
    deepFreeze(initialAssignment);
    expect(
        assignment(initialAssignment, { type : CLONE_PROBLEM, PROBLEM_INDEX : 0 })
    ).toEqual(expectedAssignment);
}

function testRenameProblem() {
    var initialAssignment = {
        APP_MODE : EDIT_ASSIGNMENT,
        ASSIGNMENT_NAME : UNTITLED_ASSINGMENT,
        PROBLEMS : [ { PROBLEM_NUMBER : "1", STEPS : [{CONTNENT : "1+2"},{CONTENT : "3"}], LAST_SHOWN_STEP : 1},
                     { PROBLEM_NUMBER : "2", STEPS : [{CONTENT : "4-2"}, {CONTENT : "2"}], LAST_SHOWN_STEP : 1}
        ]
    }
    var expectedAssignment = {
        APP_MODE : EDIT_ASSIGNMENT,
        ASSIGNMENT_NAME : UNTITLED_ASSINGMENT,
        PROBLEMS : [ { PROBLEM_NUMBER : "1", STEPS : [{CONTNENT : "1+2"},{CONTENT : "3"}], LAST_SHOWN_STEP : 1},
                     { PROBLEM_NUMBER : "1.a", STEPS : [{CONTENT : "4-2"}, {CONTENT : "2"}], LAST_SHOWN_STEP : 1}
        ]
    }
    deepFreeze(initialAssignment);
    expect(
        assignment(initialAssignment, { type : SET_PROBLEM_NUMBER, PROBLEM_INDEX : 1, NEW_PROBLEM_NUMBER : "1.a"})
    ).toEqual(expectedAssignment);
}

function testEditStep() {
    var initialAssignment = {
        APP_MODE : EDIT_ASSIGNMENT,
        ASSIGNMENT_NAME : UNTITLED_ASSINGMENT,
        PROBLEMS : [ { PROBLEM_NUMBER : "1", STEPS : [{CONTENT : "1+2"}, {CONTENT : "3"}], LAST_SHOWN_STEP : 1 },
                     { PROBLEM_NUMBER : "2", STEPS : [{CONTENT : "4-2"}, {CONTENT : "2"}], LAST_SHOWN_STEP : 1 }
        ]
    }
    var expectedAssignment = {
        APP_MODE : EDIT_ASSIGNMENT,
        ASSIGNMENT_NAME : UNTITLED_ASSINGMENT,
        PROBLEMS : [ { PROBLEM_NUMBER : "1", STEPS : [{CONTENT : "1+2"}, {CONTENT : "3"}], LAST_SHOWN_STEP : 1 },
                     { PROBLEM_NUMBER : "2", STEPS : [{CONTENT : "4-2"}, {CONTENT : "5"}], LAST_SHOWN_STEP : 1 }
        ]
    }
    deepFreeze(initialAssignment);
    expect(
        assignment(initialAssignment, { type : EDIT_STEP, PROBLEM_INDEX : 1, STEP_KEY : 1, NEW_STEP_CONTENT : "5"})
    ).toEqual(expectedAssignment);
}

function testNewStep() {
    var initialAssignment = {
        APP_MODE : EDIT_ASSIGNMENT,
        ASSIGNMENT_NAME : UNTITLED_ASSINGMENT,
        PROBLEMS : [ { PROBLEM_NUMBER : "1", STEPS : [{CONTENT : "1+2"}, {CONTENT : "3"}], LAST_SHOWN_STEP : 1 },
                     { PROBLEM_NUMBER : "2", STEPS : [{CONTENT : "4-2"}, {CONTENT : "2"}], LAST_SHOWN_STEP : 1 }
        ]
    }
    var expectedAssignment = {
        APP_MODE : EDIT_ASSIGNMENT,
        ASSIGNMENT_NAME : UNTITLED_ASSINGMENT,
        PROBLEMS : [ { PROBLEM_NUMBER : "1", STEPS : [{CONTENT : "1+2"}, {CONTENT : "3"}], LAST_SHOWN_STEP : 1 },
                     { PROBLEM_NUMBER : "2", STEPS : [{CONTENT : "4-2"}, {CONTENT : "2"}, {CONTENT : "2"}], LAST_SHOWN_STEP : 2 }
        ]
    }
    deepFreeze(initialAssignment);
    expect(
        assignment(initialAssignment, { type : NEW_STEP, PROBLEM_INDEX : 1})
    ).toEqual(expectedAssignment);
}

function testUndoStep() {
    var initialProblem = { PROBLEM_NUMBER : "1", STEPS : [{CONTENT : "1+2"}, {CONTENT : "3"}], LAST_SHOWN_STEP : 1 };
    var expectedProblem = { PROBLEM_NUMBER : "1", STEPS : [{CONTENT : "1+2"}, {CONTENT : "3"}], LAST_SHOWN_STEP : 0 };
    deepFreeze(initialProblem);
    expect(
        problem(initialProblem, { type : UNDO_STEP})
    ).toEqual(expectedProblem);
}

function testRedoStep() {
    var initialProblem = { PROBLEM_NUMBER : "1", STEPS : [{CONTENT : "1+2"}, {CONTENT : "3"}], LAST_SHOWN_STEP : 0 };
    var expectedProblem = { PROBLEM_NUMBER : "1", STEPS : [{CONTENT : "1+2"}, {CONTENT : "3"}], LAST_SHOWN_STEP : 1 };
    deepFreeze(initialProblem);
    expect(
        problem(initialProblem, { type : REDO_STEP})
    ).toEqual(expectedProblem);
}

// Run tests
// TODO - seperate these from app code
testAddProblem();
testRemoveProblem();
testCloneProblem();
testRenameProblem();
testEditStep();
testNewStep();
testUndoStep();
testRedoStep();
testGradeProblem();
testAggregateStudentWork();
// TODO - re-enable
//testAggregateStudentWorkNoAnswerKey();
testGradeSolutionClass();
testGradeSingleSolution();
testSeparateAssignments();
console.log("All tests complete");

export default FreeMath;
