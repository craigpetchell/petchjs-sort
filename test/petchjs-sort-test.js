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
    var internal, gs;
    
    var objectGen = function(k,v) {
        var obj = {
            toString: function() {
                return '[' + k + '][' + v + ']';
            }
        }
        obj[k] = v;
        return obj;
    }
    
    // quick sort data
    var qsd = function(val, group, comparator, element) {
        return {
			v: val,
			e: element,
			g: group,
			c: comparator
		};
    }
    
    module("Generic Sort tests", {
        setup: function(){
            gs = petchjs.sort;
            internal = 	gs._internal;
        },
        teardown: function(){
        }
    });

    test("extract number test", function() {
        var f = internal.extractNumber;
        strictEqual(f('3.1'), 3.1);
        strictEqual(f('-3.2'), -3.2);
        strictEqual(f('$-3.3'), -3.3);
        strictEqual(f('$3.4'), 3.4);
        strictEqual(f('4'), 4);
        strictEqual(f('-5'), -5);
        strictEqual(f('$-6'), -6);
        strictEqual(f('$7'), 7);
        strictEqual(f('123.456'), 123.456);
        strictEqual(f('-123.457'), -123.457);
        strictEqual(f('$123.458'), 123.458);
        strictEqual(f('$-123.459'), -123.459);
    }); 

    test("categoriser test", function() {
        var categoriser = internal.defaultCategoriser;
        equals(categoriser('1.2').groupSeq, 1, 'Number: 1.2');
        equals(categoriser('1').groupSeq, 1, 'Number: 1');
        equals(categoriser('-1').groupSeq, 1, 'Number: -1');
        equals(categoriser('-1.3').groupSeq, 1, 'Number: -1.3');
        equals(categoriser('$1.2').groupSeq, 1, 'Currency: $1.2');
        equals(categoriser('\u20ac1').groupSeq, 1, 'Currency: \u20ac1');
        equals(categoriser('\u00a3-1').groupSeq, 1, 'Currency: \u00a3-1');
        equals(categoriser('\u00a5-1.3').groupSeq, 1, 'Currency: \u00a5-1.3');
        equals(categoriser('\u20a9-1234234.32344').groupSeq, 1, 'Currency: \u20a9-1234234.32344');
        equals(categoriser(' -1234234.32344').groupSeq, 2, 'Text: " -1234234.32344"');
        equals(categoriser('-1234234.32344 ').groupSeq, 2, 'Text: "-1234234.32344 "');
        equals(categoriser('$ -1234234.32344').groupSeq, 2, 'Text: "$ -1234234.32344"');
        equals(categoriser('-1234234.32344.234').groupSeq, 2, 'Text: "-1234234.32344.234"');
        equals(categoriser('ABC DEF').groupSeq, 2, 'Text: "ABC DEF"');
    });
    
    test("numeric comparator test", function() {
        var c = internal.comparators.numericComparator;
        equals(c(qsd(1), qsd(2)), -1);
        equals(c(qsd(2), qsd(1)), 1);
        equals(c(qsd(3), qsd(3)), 0);
        equals(c(qsd(3.0), qsd(3)), 0);
        equals(c(qsd('$3.0'), qsd(3)), 0);
        equals(c(qsd('$3.0'), qsd(3.1)), -1);
        equals(c(qsd(3.1), qsd('$3.0')), 1);
    });

    test("numeric comparator caching test", function() {
        var c = internal.comparators.numericComparator;
        var lnum = { v: 1 },
            lstr = { v: '2'},
            rnum = { v: 3 },
            rstr = { v: '4'};
        try {
            c({}, {});
            ok(fail, 'Exception should be thrown');
        } catch(e) {
            ok(true, 'Exception was thrown - as expected');
        }
        // Value get's cached
        c(lnum, rnum);
        strictEqual(lnum._num, 1, 'Value cached');
        strictEqual(rnum._num, 3, 'Value cached');
        c(lstr, rstr);
        strictEqual(lstr._num, 2, 'Value cached');
        strictEqual(rstr._num, 4, 'Value cached');
        // Confirm use of cached value
        delete lnum.v;
        delete lstr.v;
        delete rnum.v;
        delete rstr.v;
        c(lnum, rnum);
        strictEqual(lnum._num, 1, 'Use cached value cached');
        strictEqual(rnum._num, 3, 'Use cached value cached');
        c(lstr, rstr);
        strictEqual(lstr._num, 2, 'Use cached value cached');
        strictEqual(rstr._num, 4, 'Use cached value cached');
    });

    test("default comparator test", function() {
        var c = internal.comparators.defaultComparator;
        equals(c(qsd('abc'), qsd('abc')), 0);
        equals(c(qsd('abc'), qsd('ABC')), 0);
        ok(c(qsd('cba'), qsd('ABC')) > 0);
        ok(c(qsd('abc'), qsd('CBA')) < 0);
    });

    test("default comparator caching test", function() {
        var c = internal.comparators.defaultComparator;
        var lnum = { v: 1 },
            lstr = { v: '2'},
            lobj = { v: objectGen('a', 'xyz') },
            rnum = { v: 3 },
            rstr = { v: '4'},
            robj = { v: objectGen('b', 'abc') };
        try {
            c({}, {});
            ok(fail, 'Exception should be thrown');
        } catch(e) {
            ok(true, 'Exception was thrown - as expected');
        }
        // Value get's cached
        c(lnum, rnum);
        strictEqual(lnum._str, '1', 'Value cached');
        strictEqual(rnum._str, '3', 'Value cached');
        c(lstr, rstr);
        strictEqual(lstr._str, '2', 'Value cached');
        strictEqual(rstr._str, '4', 'Value cached');
        c(lobj, robj);
        strictEqual(lobj._str, '[a][xyz]', 'Value cached');
        strictEqual(robj._str, '[b][abc]', 'Value cached');
        // Confirm use of cached value
        delete lnum.v;
        delete lstr.v;
        delete lobj.v;
        delete rnum.v;
        delete rstr.v;
        delete robj.v;
        c(lnum, rnum);
        strictEqual(lnum._str, '1', 'Use cached value cached');
        strictEqual(rnum._str, '3', 'Use cached value cached');
        c(lstr, rstr);
        strictEqual(lstr._str, '2', 'Use cached value cached');
        strictEqual(rstr._str, '4', 'Use cached value cached');
        c(lobj, robj);
        strictEqual(lobj._str, '[a][xyz]', 'Use cached value cached');
        strictEqual(robj._str, '[b][abc]', 'Use cached value cached');
    });

    test("extractSortableData defaultCategoriser test", function() {
        var e = internal.extractSortableData;
        ok(false, 'todo');
    });

    test("extractSortableData custom categoriser test", function() {
        ok(false, 'todo');
    });

    test("petchjs.sort test", function() {
        ok(false, 'todo');
    });

})();