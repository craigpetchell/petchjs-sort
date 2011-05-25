PetchJS - Sort
==============

A Javascript library to support sorting of arbitary Javascript objects, including DOM elements, JQUery objects or just String and numbers.

There is support for primary sorting by category, with secondary sorting by type within that category.

By default there is a numeric (which also treats common currencies as numbers), and a generic object/string sorter (relying on a useful implementation of toString for sorting). Numerical data will appear first, followed by object/string data.

Alternate categorises and sorters may be implemented.

A data extraction function is required to extract data from each element in an array which will then be sorted.

Caching of the extracted data is performed for the duration of the sort.

TableSort
=========

An implementation of table sorting is provided which is both colspan and rowspan aware.

Sorting over a column contain a colspan with treat the values of 2nd, 3rd, etc columns as an empty String when sorting.

Sorting with a row span will keep the rowspan'd rows together and they will not be sorted. Data for a particular cell when doing the sort will be <row1.cell + \n + row2.cell ...>.

TableSort depends on JQuery, and the awesome JQuery Column cell selector by Bram Stein.
