var self = this;
self.db = null;
var serverUrl = "http://192.168.1.118:8080/demoservlet/";
angular.module('starter.getdataservice', ['ionic'])
    .factory('DATABASE', function($q) {

        //	for initialization of databse 
        self.init = function() {

            if (window.cordova) {
                //alert('hi');
                self.db = window.sqlitePlugin.openDatabase({
                    name: "apconDB.db",
                    createFromLocation: 1
                });

            } else {
                //alert('hi in browser');

                self.db = window.openDatabase("apconDB.db", "1", "RajyogDB", 200000);

                var modifiedDateTime = localStorage.getItem("modifiedDateTime");
                if (modifiedDateTime == null) {
                    self.db.transaction(function(transaction) {
                        transaction.executeSql("DROP TABLE IF EXISTS person", [], function(transaction, result) {}, function(transaction, error) {

                        });
                    });
                }
                self.db.transaction(function(transaction) {
                    transaction.executeSql("CREATE TABLE IF NOT EXISTS person(Id INTEGER PRIMARY KEY,name TEXT,email TEXT,mbnum INTEGER,dob TEXT);", [], function(transaction, result) {}, function(transaction, error) {});
                });
            }

        }

        /*method to fetch data from db*/
        self.fetchAll = function(result) {
            //alert('feching records');
            var output = [];
            for (var i = 0; i < result.rows.length; i++) {
                output.push(result.rows.item(i));
            }
            // alert(JSON.stringify(output));
            return output;
        };

        self.query = function(query, bindings) {
            bindings = typeof bindings !== 'undefined' ? bindings : [];
            var deferred = $q.defer();
            self.db.transaction(function(transaction) {
                transaction.executeSql(query, bindings, function(transaction, result) {
                    deferred.resolve(result);
                }, function(transaction, error) {
                    deferred.reject(error);
                });
            });
            return deferred.promise;
        };

        self.inserData = function(persons) {
            self.db.transaction(
                function(tx) {
                    var l = persons.length;
                    var sql = "INSERT OR REPLACE INTO person(Id,name ,email ,mbnum ,dob) VALUES (?,?,?,?,?)";
                    var person;
                    for (var i = 0; i < l; i++) {
                        person = persons[i];
                        console.log(person.Id, person.name, person.email, person.mbnum, person.dob);
                        var params = [person.Id, person.name, person.email, person.mbnum, person.dob];
                        tx.executeSql(sql, params);
                    }

                }, this.txErrorHandler,
                function(tx) {
                    //callback();
                }
            );

        };
        return self;

    })

.factory('getData', function(DATABASE, $http) {

    self.getViewData = function() {
        var selectQuery = "select * from person;";
        return DATABASE.query(selectQuery)
            .then(function(result) {
                    var messages = DATABASE.fetchAll(result);
                    console.log(messages);
                    // alert(JSON.stringify(messages));
                    return messages;
                },
                function(err) {
                    console.log('query ' + err);
                });
    }

    /*method to view searched data*/
    self.getselectedData = function(name) {
        if ((name + '').length == 0 || typeof name === 'undefined') {
            var selectQuery = "select * from person;";
        } else {
            var selectQuery = "select * from person where name like '%" + name + "%';";

        }

        return DATABASE.query(selectQuery)
            .then(function(result) {
                    var messages = DATABASE.fetchAll(result);
                    console.log(messages);
                    // alert(JSON.stringify(messages));
                    return messages;
                },
                function(err) {
                    console.log('query ' + err);
                });
    }

    /*method to  call http service to get all data*/
    self.getAllData = function() {
        var modifiedDateTime = localStorage.getItem("modifiedDateTime");
        if (modifiedDateTime == null) {
            modifiedDateTime = "0000-00-00 00:00:00";
        }
        var url = serverUrl + "getviewData?check=1&serverDateTime=" + modifiedDateTime;
        return $http.get(url, {
                timeout: 10000
            })
            .then(function(response) {
                    console.log(response.data.alldata);
                    DATABASE.inserData(response.data.alldata);
                    // console.log(response.data.orderslist)  ;

                    localStorage.setItem("modifiedDateTime", response.data.currentDateTime);
                    return response.data.alldata;
                },
                function(err) {
                    console.error('ERR', err);
                    return false;
                });
    };

    /*method to call http service to add data*/
    self.addDataService = function(data) {
        var url = serverUrl + "addData?name=" + data.name + "&email=" + data.email + "&mbnum=" + data.mbnum + "&dob=" + data.dob;
        return $http.get(url, {
                timeout: 10000
            })
            .then(function(response) {
                    console.log(response);
                    return true;
                },
                function(err) {
                    console.error('ERR', err);
                    return false;
                });
    }

    /*method to call http service to delete data*/
    self.deleteDataService = function(Id) {
        var url = serverUrl + "deleteData?Id=" + Id;
        return $http.get(url, {
                timeout: 10000
            })
            .then(function(response) {

                    var selectQuery = "delete from person where Id =" + Id;
                    alert(selectQuery);
                    DATABASE.query(selectQuery).then(function(result) {
                            console.log(result);
                            // alert(JSON.stringify(messages));

                        },
                        function(err) {
                            console.log('query ' + err);
                        });
                    return response;
                },
                function(err) {
                    console.error('ERR', err);
                    return false;
                });


    }

    /*method to call http service to edit data*/
    self.editService = function(data) {
        var url = serverUrl + "updateData?Id=" + data.Id + "&name=" + data.name + "&email=" + data.name + "&mbnum=" + data.mbnum + "&dob=" + data.dob;
        return $http.get(url, {
                timeout: 10000
            })
            .then(function(response) {
                    var selectQuery = "UPDATE person SET name='" + data.name + "',email='" + data.email + "',mbnum='" + data.mbnum + "',dob='" + data.dob + "' where Id=" + data.Id;
                    DATABASE.query(selectQuery).then(function(result) {
                            console.log(result);
                            // alert(JSON.stringify(messages));								
                        },
                        function(err) {
                            console.log('query ' + err);
                        });
                    return response;
                },
                function(err) {
                    console.error('ERR', err);
                    return false;
                });
    }

    return self;
})