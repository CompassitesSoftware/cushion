/**
 * database object
 *
 * @constructor
 * @param {string} name name of the database
 * @param {nodecouch.Connection} connection connection object
 */
var Database = function(name, connection) {
  this._name = name;
  this._connection = connection;
};


/**
 * create the database
 *
 * @param {function(error, confirm)} callback function that will be called,
 *     after creating the database, or if there was an error
 */
Database.prototype.create = function(callback) {
  this._connection.request('PUT', this._name, callback);
};


/**
 * check if database exists
 *
 * @param {function(error, exists)} callback function that will be called, after
 *     getting the information database exists or not, of if there was an error
 */
Database.prototype.exists = function(callback) {
  this._connection.request('GET', this._name, function(error, response) {
    if (error && error.error === 'not_found') {
      response = false;
    }

    callback(
      error,
      (error && error.error === 'not_found') ? false : true
    );
  });
};

exports.Database = Database;