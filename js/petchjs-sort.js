/*
 * Copyright 2011 Craig Petchell
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *     http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */
(function() {
	// Allow exposing of private methods for testing via predeclaring of empty object test.org.petchell.js.genericsort.privates.
	var _ = {};
	var root = window;

	// Global name space
	root.petchjs = root.petchjs || {};
	
	/**
	 * A generic sorting utility
	 * 
	 * @param toSort array of things to sort. This array is not modified by this sort.
	 * @param config configuration for the sorter
	 *     {
	 *        dataExtractor: function to extract a String from an element of toSort. function(toSort[i]) : String
	 *        categoriser: function to classify a row. function(value, element) : { groupSeq: Number, sorter: sort function }
	 *        reverse: boolean - whether to do a reverse sort
	 *     }
	 * @return a new array with the elements sorted
	 */
	petchjs.sort = function(toSort, config) {
		var sortableData = _.transformToSortData(toSort,config);
		sortableData.sort(reverse ? _.reverseCategoryComparator : _.forwardCategoryComparator);
		return _.transformToArray(sortableData);
	};
	
	// Internal
	// Includes common currencies: dollar, euro, pound, yen, won
	_.numberRegex = /^[\$\u20ac\u00a3\u00a5\u20a9]?(-?\d+\.?\d*)$/
	
	_.extractNumber = function(v) {
        return parseFloat(_.numberRegex.exec(v)[1]);
	};
	
	_.transformToSortData = function(toSort, config) {
		var i, len, sortableData = new Array(len);
		for(i = 0, len = toSort.length; i < len; i++) {
			sortableData[i] = _.extractSortableData(toSort[i], config);
		}
		return sortableData;
	};
	
	_.extractSortableData = function(e, config) {
		var val = config.dataExtractor(e);
		var type = config.categoriser ? config.categoriser(val, e) : _.defaultCategoriser(val, e);
		return {
			v: val, // value
			e: element, // original element
			g: type.groupSeq, // grouping order (primary sort) - Number
			c: type.comparator // group sorter (secondary sorter)
		};
	};
	
	_.transformToArray = function(sortableData) {
		var i, len = sortableData.length, sorted = new Array(len);
		for(i = 0; i < len; i++) {
			sorted[i] = sortableData[i].e;
		}
		return sorted;
	};
	
	_.defaultCategoriser = function(v, e) {
		if(_.numberRegex.test(v)) {
            return { 
                groupSeq: 1, 
                comparator: _.comparators.numericComparator
            };
		}
		return { 
            groupSeq: 2, 
            comparator: _.comparators.defaultComparator
        };
	};
	
	_.forwardCategoryComparator = function(l, r) {
	    if(l.g == r.g) {
	        // same category - use comparator for category
	        l.s(l, r);
	    } 
	    return l.g < r.g ? -1 : 1;
	};
	
	_.reverseCategoryComparator = function() {
	    return -1 * _.forwardCategoryComparator(l, r);
	};
	
	_.comparators = {
		numericComparator: function(l, r) {
		    var lv = l._num != undefined ? l._num : l._num = _.extractNumber(l.v);
		    var rv = r._num != undefined ? r._num : r._num = _.extractNumber(r.v);
		    return lv == rv ? 0 : lv < rv ? -1 : 1;
		},
		
		defaultComparator: function(l, r) {
		    var lv = l._str != undefined ? l._str : l._str = l.v && l.v.toString().toLocaleLowerCase() || '';
		    var rv = r._str != undefined ? r._str : r._str = r.v && r.v.toString().toLocaleLowerCase() || '';
		    return lv.localeCompare(rv);
		}
	};
	
	// internal use only
	petchjs.sort._internal = _;

})();