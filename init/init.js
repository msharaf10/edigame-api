/*
*
*  ->  FILENAME :    init.js
*
*  ->  RESPONSIBILITY :
*           initiate resources for the application.
*
*  ->  DESCRIPTION :
*           Standalone script that initiate resources for the application such as
*           make first super admin, etc, to get started just run `node init.js`.
*           However, you might exports it to server main file( index.js ).
*
*  ->  LAST MODIFIED BY :
*           Mohamed Sharaf
*
*/

/* clear the console */
process.stdout.write('\x1Bc');

console.log( 'running init script...' );

require( './createFirstSuperAdmin' );
