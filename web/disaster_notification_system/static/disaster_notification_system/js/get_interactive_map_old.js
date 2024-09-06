




$(document).ready(function () {
    let getHazardsForMap;
    import('./get_hazards_for_map.js').then(module => {
        getHazardsForMap = module.default;
        console.log(module)
    })
    var epmGrantedTable = $("#grant-table").DataTable({
        lengthMenu: [
            [10, 25, 50, -1], // number
            [10, 25, 50, "All"], //display number
        ],
        columns: [
            {title: "Permit Number", data: "DISPLAYNAM", 'class': 'text-center'},
            {title: "Permit Type", data: "PERMITTY_1", 'class': 'text-center'},
            {title: "Permit Status", data: "PERMITST_1", 'class': 'text-center'},
            {title: "Permit sub-status", data: "PERMITST_2", 'class': 'text-center'},
            {title: "Lodge Date", data: "LODGEDATE", 'class': 'text-center'},
            {title: "Grant Date", data: "APPROVEDAT", 'class': 'text-center'},
            {title: "Expiry Date", data: "EXPIRYDATE", 'class': 'text-center'},
            {title: "Authorised Holder Name", data: "AUTHORIS_1", 'class': 'text-center'},
            {title: "Native Title Category", data: "NATIVETITL", 'class': 'text-center'},
            {title: "Mineral", data: "PERMITMINE", 'class': 'text-center'},
            {title: "Purpose", data: "PERMITPURP", 'class': 'text-center'},
            {title: "Permit Name", data: "PERMITNAME", 'class': 'text-center'},
            {title: "Permit Number Other", data: "PERMITNUMB", 'class': 'text-center'},
            {title: "Permit Type Abbreviation", data: "PERMITTY_2", 'class': 'text-center'},
            {title: "Permit ID", data: "PERMITID", 'class': 'text-center'},
        ],
        columnDefs: [{
            "defaultContent": "None",
            "targets": "_all"
        }],
        dom: 'Bfrt<"row"<"col-sm-12 col-md-3"l><"col-sm-12 col-md-4"i><"col-sm-12 col-md-5"p>>',
        buttons: [
            {
                text: '<i class="fa fa-trash"></i>',
                action: function () {
                    var epmGrantedTable = $("#grant-table").DataTable();
                    var epmApplicationTable = $("#application-table").DataTable();
                    var epmDiasterTable = $("#natural-disasters-table").DataTable();
                    epmGrantedTable.rows(".selected").remove().draw();

                    $("#flip").empty();
                    $("#flip").append(`Results <span class="badge rounded-pill">${epmGrantedTable.rows().count() + epmApplicationTable.rows().count() + epmDiasterTable.rows().count()}</span>`);
                    // Add number to grant tab
                    $("#nav-grant-tab").empty();
                    $("#nav-grant-tab").append(`EPM Grants <span class="badge rounded-pill">${epmGrantedTable.rows().count()}</span>`);
                    // add number to display tab
                    $("#nav-application-tab").empty();
                    $("#nav-application-tab").append(`EPM Applications <span class="badge rounded-pill">${epmApplicationTable.rows().count()}</span>`);
                    // add number to display tab
                    $("#nav-natural-disasters-tab").empty();
                    $("#nav-natural-disasters-tab").append(`EPM Natural Disasters <span class="badge rounded-pill">${epmDiasterTable.rows().count()}</span>`);
                },
            },
            {
                text: '<i class="fa fa-id-badge fa-fw" aria-hidden="true"></i>',
                action: function (e, dt, node) {
                    $(dt.table().node()).toggleClass("cards");
                    $(".fa", node).toggleClass(["fa-table", "fa-id-badge"]);

                    dt.draw("page");
                },
                className: "btn-sm",
                attr: {
                    title: "Change views",
                },
            },
            "colvis",
            {
                extend: "collection",
                className: "custom-html-collection",
                text: "Export",
                buttons: [
                    "csv",
                    "excel",
                    {
                        text: "JSON",
                        action: function (e, dt, button, config) {
                            var data = dt.buttons.exportData();

                            $.fn.dataTable.fileSave(
                                new Blob([JSON.stringify(data)]),
                                "Interactive Map.json"
                            );
                        },
                    },
                ],
            },
        ],
        select: {
            style: "multi",
        },
        drawCallback: function (settings) {
            var api = this.api();
            var $table = $(api.table().node());

            if ($table.hasClass("cards")) {
                // Create an array of labels containing all table headers
                var labels = [];
                $("thead th", $table).each(function () {
                    labels.push($(this).text());
                });

                // Add data-label attribute to each cell
                $("tbody tr", $table).each(function () {
                    $(this)
                        .find("td")
                        .each(function (column) {
                            $(this).attr("data-label", labels[column]);
                        });
                });

                var max = 0;
                $("tbody tr", $table)
                    .each(function () {
                        max = Math.max($(this).height(), max);
                    })
                    .height(max);
            } else {
                // Remove data-label attribute from each cell
                $("tbody td", $table).each(function () {
                    $(this).removeAttr("data-label");
                });

                $("tbody tr", $table).each(function () {
                    $(this).height("auto");
                });
            }
        },
    });

    var epmApplicationTable = $("#application-table").DataTable({
        lengthMenu: [
            [10, 25, 50, -1], // number
            [10, 25, 50, "All"], //display number
        ],
        columns: [
            {title: "Permit Number", data: "DISPLAYNAM"},
            {title: "Permit Type", data: "PERMITTY_1"},
            {title: "Permit Status", data: "PERMITST_1"},
            {title: "Permit sub-status", data: "PERMITST_2"},
            {title: "Lodge Date", data: "LODGEDATE"},
            {title: "Authorised Holder Name", data: "AUTHORIS_1"},
            {title: "Native Title Category", data: "NATIVETITL"},
            {title: "Mineral", data: "PERMITMINE"},
            {title: "Purpose", data: "PERMITPURP"},
            {title: "Permit Name", data: "PERMITNAME"},
            {title: "Permit Number Other", data: "PERMITNUMB"},
            {title: "Permit Type Abbreviation", data: "PERMITTY_2"},
            {title: "Permit ID", data: "PERMITID"},
        ],
        dom: 'Bfrt<"row"<"col-sm-12 col-md-3"l><"col-sm-12 col-md-4"i><"col-sm-12 col-md-5"p>>',
        buttons: [
            {
                text: '<i class="fa fa-trash"></i>',
                action: function () {
                    var epmGrantedTable = $("#grant-table").DataTable();
                    var epmApplicationTable = $("#application-table").DataTable();
                    var epmDiasterTable = $("#natural-disasters-table").DataTable();
                    epmApplicationTable.rows(".selected").remove().draw();

                    $("#flip").empty();
                    $("#flip").append(`Results <span class="badge rounded-pill">${epmGrantedTable.rows().count() + epmApplicationTable.rows().count() + epmDiasterTable.rows().count()}</span>`);
                    // Add number to grant tab
                    $("#nav-grant-tab").empty();
                    $("#nav-grant-tab").append(`EPM Grants <span class="badge rounded-pill">${epmGrantedTable.rows().count()}</span>`);
                    // add number to display tab
                    $("#nav-application-tab").empty();
                    $("#nav-application-tab").append(`EPM Applications <span class="badge rounded-pill">${epmApplicationTable.rows().count()}</span>`);
                    // add number to display tab
                    $("#nav-natural-disasters-tab").empty();
                    $("#nav-natural-disasters-tab").append(`EPM Natural Disasters <span class="badge rounded-pill">${epmDiasterTable.rows().count()}</span>`);
                },
            },
            {
                text: '<i class="fa fa-id-badge fa-fw" aria-hidden="true"></i>',
                action: function (e, dt, node) {
                    $(dt.table().node()).toggleClass("cards");
                    $(".fa", node).toggleClass(["fa-table", "fa-id-badge"]);

                    dt.draw("page");
                },
                className: "btn-sm",
                attr: {
                    title: "Change views",
                },
            },
            "colvis",
            {
                extend: "collection",
                className: "custom-html-collection",
                text: "Export",
                buttons: [
                    "csv",
                    "excel",
                    {
                        text: "JSON",
                        action: function (e, dt, button, config) {
                            var data = dt.buttons.exportData();

                            $.fn.dataTable.fileSave(
                                new Blob([JSON.stringify(data)]),
                                "Export.json"
                            );
                        },
                    },
                ],
            },
        ],
        select: {
            style: "multi",
        },
        drawCallback: function (settings) {
            var api = this.api();
            var $table = $(api.table().node());

            if ($table.hasClass("cards")) {
                // Create an array of labels containing all table headers
                var labels = [];
                $("thead th", $table).each(function () {
                    labels.push($(this).text());
                });

                // Add data-label attribute to each cell
                $("tbody tr", $table).each(function () {
                    $(this)
                        .find("td")
                        .each(function (column) {
                            $(this).attr("data-label", labels[column]);
                        });
                });

                var max = 0;
                $("tbody tr", $table)
                    .each(function () {
                        max = Math.max($(this).height(), max);
                    })
                    .height(max);
            } else {
                // Remove data-label attribute from each cell
                $("tbody td", $table).each(function () {
                    $(this).removeAttr("data-label");
                });

                $("tbody tr", $table).each(function () {
                    $(this).height("auto");
                });
            }
        },
    });
    var epmDisasterTable = $("#natural-disasters-table").DataTable({
        lengthMenu: [
            [10, 25, 50, -1], // number
            [10, 25, 50, "All"], //display number
        ],

        columns: [
            {title: "Warning ID", data: "WARNINGID"},
            {title: "Warning Name", data: "NAME"},
            {title: "Warning Type", data: "TYPE"},
            {title: "Warning Initial Date", data: "INITIALDATE"},
            {title: "Warning Last Updated", data: "LASTUPDATED"},
            {title: "Warning Location", data: "LOCATION"},
            {title: "Warning Severity", data: "SEVERITY"},
            {title: "Warning Locality", data: "LOCALITY"},
        ],
        dom: 'Bfrt<"row"<"col-sm-12 col-md-3"l><"col-sm-12 col-md-4"i><"col-sm-12 col-md-5"p>>',
        buttons: [
            {
                text: '<i class="fa fa-trash"></i>',
                action: function () {
                    var epmGrantedTable = $("#grant-table").DataTable();
                    var epmApplicationTable = $("#application-table").DataTable();
                    var epmDiasterTable = $("#natural-disasters-table").DataTable();
                    epmDiasterTable.rows(".selected").remove().draw();

                    $("#flip").empty();
                    $("#flip").append(`Results <span class="badge rounded-pill">${epmGrantedTable.rows().count() + epmApplicationTable.rows().count() + epmDiasterTable.rows().count()}</span>`);
                    // Add number to grant tab
                    $("#nav-grant-tab").empty();
                    $("#nav-grant-tab").append(`EPM Grants <span class="badge rounded-pill">${epmGrantedTable.rows().count()}</span>`);
                    // add number to display tab
                    $("#nav-application-tab").empty();
                    $("#nav-application-tab").append(`EPM Applications <span class="badge rounded-pill">${epmApplicationTable.rows().count()}</span>`);
                    // add number to display tab
                    $("#nav-natural-disasters-tab").empty();
                    $("#nav-natural-disasters-tab").append(`EPM Natural Disasters <span class="badge rounded-pill">${epmDiasterTable.rows().count()}</span>`);
                },
            },
            {
                text: '<i class="fa fa-id-badge fa-fw" aria-hidden="true"></i>',
                action: function (e, dt, node) {
                    $(dt.table().node()).toggleClass("cards");
                    $(".fa", node).toggleClass(["fa-table", "fa-id-badge"]);

                    dt.draw("page");
                },
                className: "btn-sm",
                attr: {
                    title: "Change views",
                },
            },
            "colvis",
            {
                extend: "collection",
                className: "custom-html-collection",
                text: "Export",
                buttons: [
                    "csv",
                    "excel",
                    {
                        text: "JSON",
                        action: function (e, dt, button, config) {
                            var data = dt.buttons.exportData();
                            $.fn.dataTable.fileSave(
                                new Blob([JSON.stringify(data)]),
                                "Export.json"
                            );
                        },
                    },
                ],
            },
        ],
        select: {
            style: "multi",
        },
        drawCallback: function (settings) {
            var api = this.api();
            var $table = $(api.table().node());
            if ($table.hasClass("cards")) {
                // Create an array of labels containing all table headers
                var labels = [];
                $("thead th", $table).each(function () {
                    labels.push($(this).text());
                });

                // Add data-label attribute to each cell
                $("tbody tr", $table).each(function () {
                    $(this)
                        .find("td")
                        .each(function (column) {
                            $(this).attr("data-label", labels[column]);
                        });
                });
                var max = 0;
                $("tbody tr", $table)
                    .each(function () {
                        max = Math.max($(this).height(), max);
                    })
                    .height(max);
            } else {
                // Remove data-label attribute from each cell
                $("tbody td", $table).each(function () {
                    $(this).removeAttr("data-label");
                });

                $("tbody tr", $table).each(function () {
                    $(this).height("auto");
                });
            }
        },
    });

    // Show modal on row click
    $('#natural-disasters-table tbody').on('click','tr', function () {
        let data = epmDisasterTable.row(this).data();
        $('#NaturalDisasterNotificationDetailsModal').modal('show') 
        $('#modalDetailsId').text(data.WARNINGID)       
        $('#modalDetailsName').text(data.NAME)
        $('#modalDetailsType').text(data.TYPE)
        $('#modalDetailsInitialDate').text(data.INITIALDATE)
        $('#modalDetailsLastUpdated').text(data.LASTUPDATED)
        $('#modalDetailsLocation').text(data.LOCATION)
        $('#modalDetailsSeverity').text(data.SEVERITY)
        $('#modalDetailsLocality').text(data.LOCALITY)
        
    });


    //Setting up the map
    const map = L.map('map', {drawControl: true, fullscreenControl: true,}).setView([-20.917574, 142.702789], 6);

    //Setting Up Map Display
    const tiles = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        minZoom: 4,
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    const minitiles = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        minZoom: 2, maxZoom: 3,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    })

    var miniMap = new L.Control.MiniMap(minitiles, {toggleDisplay: true}).addTo(map);

    // Highlighting Function
    function highlightTenement(tenement) {
        var layer = tenement.target;
        layer.setStyle({
            weight: 5,
            fillOpacity: 0.7
        });
        layer.bringToFront();
    }

    // Zoom Function
    function zoomToTenement(tenement) {
        map.fitBounds(tenement.target.getBounds());
    }

    //Feature Group for each Layer
    var pendingApplicationsFeature = new L.featureGroup({}).addTo(map);
    var grantedApplicationsFeature = new L.featureGroup({}).addTo(map);
    var expiringApplicationsFeature = new L.featureGroup({});
    var highlightExpiring = new L.featureGroup({}).addTo(expiringApplicationsFeature);
    var moratoriumApplicationsFeature = new L.featureGroup({});
    var disastersApplicationsFeature = new L.featureGroup({});
    var roadHazardApplicationsFeature = new L.featureGroup({});
    var searchTenementFeature = new L.featureGroup({});
    var drawnItems = new L.FeatureGroup().addTo(map);

    //Pending Application
    let pendingRanges = [];
    let pendingApplications;
    let pendingLegends;
    $.getJSON("pending", function (data) {
        //Get the geoJson file data
        pendingApplications = L.geoJson(data, {
            // Polygon Colour
            style: function (feature) {
                if (!(feature.properties.LODGE_RANGE in pendingRanges)) {
                    pendingRanges[feature.properties.LODGE_RANGE] = feature.properties.COLOR;
                }
                return {color: feature.properties.COLOR};
            },
            // Events on mouse hover and click
            onEachFeature: function onEachFeature(feature, layer) {
                layer.on({
                    mouseover: highlightTenement,
                    mouseout: function (tenement) {
                        pendingApplications.resetStyle(tenement.target);
                    },
                    click: zoomToTenement
                });
                // Popup that displays information of the polygon on mouse hover
                layer.bindTooltip(function (layer) {
                    let div = L.DomUtil.create('div');
                    let handleObject = feature => typeof (feature) == 'object' ? JSON.stringify(feature) : feature;
                    let fields = ["DISPLAYNAM", "LODGEDATE", "AUTHORIS_1"]; //Geojson file data properties
                    let aliases = ["", "Application Date:", "Company Name:"]; //Name to display above properties args
                    //Table to display in the popup
                    let table = '<table>' + String(fields.map((v, i) =>
                            `<tr>
								<th>${aliases[i]}</th>
								
								<td>${handleObject(layer.feature.properties[v])}</td>
							</tr>`).join(''))
                        + '</table>';
                    div.innerHTML = table;
                    return div
                }, {
                     // direction of the tooltip from the mouse
                    sticky: true, // whether to follow the mouse or not
                    className: "foliumtooltip" // display design class
                });
            }
        }).addTo(pendingApplicationsFeature); // Add it to Pending Applications Layer
    
        // get the keys in ascending order and assign
        // color and label to the each legend item
        let pendRanges = Object.keys(pendingRanges);
                pendRanges = pendRanges.sort();
                pendingLegends = L.control.Legend({
                    position: "bottomright",
                    title: 'Lodged Date Ranges',
                    legends: [{
                        label: pendRanges[0],
                        type: "polygon",
                        sides: 4,
                        color: pendingRanges[pendRanges[0]],
                        fillColor: pendingRanges[pendRanges[0]],
                        fillOpacity: 0.3,
                        weight: 2
                    }, {
                        label: pendRanges[1],
                        type: "polygon",
                        sides: 4,
                        color: pendingRanges[pendRanges[1]],
                        fillColor: pendingRanges[pendRanges[1]],
                        fillOpacity: 0.3,
                        weight: 2
                    }, {
                        label: pendRanges[2],
                        type: "polygon",
                        sides: 4,
                        color: pendingRanges[pendRanges[2]],
                        fillColor: pendingRanges[pendRanges[2]],
                        fillOpacity: 0.3,
                        weight: 2
                    }, {
                        label: pendRanges[3],
                        type: "polygon",
                        sides: 4,
                        color: pendingRanges[pendRanges[3]],
                        fillColor: pendingRanges[pendRanges[3]],
                        fillOpacity: 0.3,
                        weight: 2
                    }, {
                        label: pendRanges[4],
                        type: "polygon",
                        sides: 4,
                        color: pendingRanges[pendRanges[4]],
                        fillColor: pendingRanges[pendRanges[4]],
                        fillOpacity: 0.3,
                        weight: 2
                    }]
                });
                map.addControl(pendingLegends);
            
    });

    //Active Application
    // check pending application for code explanation
    let activeRanges = [];
    let activeApplications;
    let activeLegends;
    $.getJSON("active", function (data) {
        //Get the geoJson file data
        activeApplications = L.geoJson(data, {
            // Polygon Colour
            style: function (feature) {
                if (!(feature.properties.APPROVE_RANGE in activeRanges)) {
                    activeRanges[feature.properties.APPROVE_RANGE] = feature.properties.COLOR;
                }
                return {color: feature.properties.COLOR};
            },
            // Events on mouse hover and click
            onEachFeature: function onEachFeature(feature, layer) {
                layer.on({
                    mouseover: highlightTenement,
                    mouseout: function (tenement) {
                        activeApplications.resetStyle(tenement.target);
                    },
                    click: zoomToTenement
                });
                // Popup that displays information of the polygon on mouse hover
                layer.bindTooltip(function (layer) {
                    let div = L.DomUtil.create('div');

                    let handleObject = feature => typeof (feature) == 'object' ? JSON.stringify(feature) : feature;
                    let fields = ["DISPLAYNAM", "APPROVEDAT", "AUTHORIS_1"];
                    let aliases = ["", "Approved Date:", "Company Name:"];
                    let table = '<table>' + String(fields.map((v, i) =>
                            `<tr>
								<th>${aliases[i]}</th>
								
								<td>${handleObject(layer.feature.properties[v])}</td>
							</tr>`).join(''))
                        + '</table>';
                    div.innerHTML = table;
                    return div
                }, {
                    
                    sticky: true,
                    className: "foliumtooltip"
                });
            }
        }).addTo(grantedApplicationsFeature);

        // get the keys in ascending order and assign
        // color and label to the each legend item
        let actRanges = Object.keys(activeRanges);
        actRanges = actRanges.sort();
        activeLegends = L.control.Legend({
                    position: "bottomright",
                    title: 'Granted Date Ranges',
                    legends: [{
                        label: actRanges[0],
                        type: "polygon",
                        sides: 4,
                        color: activeRanges[actRanges[0]],
                        fillColor: activeRanges[actRanges[0]],
                        fillOpacity: 0.3,
                        weight: 2
                    }, {
                        label: actRanges[1],
                        type: "polygon",
                        sides: 4,
                        color: activeRanges[actRanges[1]],
                        fillColor: activeRanges[actRanges[1]],
                        fillOpacity: 0.3,
                        weight: 2
                    }, {
                        label: actRanges[2],
                        type: "polygon",
                        sides: 4,
                        color: activeRanges[actRanges[2]],
                        fillColor: activeRanges[actRanges[2]],
                        fillOpacity: 0.3,
                        weight: 2
                    }, {
                        label: actRanges[3],
                        type: "polygon",
                        sides: 4,
                        color: activeRanges[actRanges[3]],
                        fillColor: activeRanges[actRanges[3]],
                        fillOpacity: 0.3,
                        weight: 2
                    }, {
                        label: actRanges[4],
                        type: "polygon",
                        sides: 4,
                        color: activeRanges[actRanges[4]],
                        fillColor: activeRanges[actRanges[4]],
                        fillOpacity: 0.3,
                        weight: 2
                    }, {
                        label: actRanges[5],
                        type: "polygon",
                        sides: 4,
                        color: activeRanges[actRanges[5]],
                        fillColor: activeRanges[actRanges[5]],
                        fillOpacity: 0.3,
                        weight: 2
                    },]
                });
        map.addControl(activeLegends);
    });
    

    /* // Labelling
    let actMarker;
    $.getJSON("actMarker.json", function (data) {
        actMarker = L.geoJson(data, {
          style: function(feature) {
            return {html: feature.properties.COLOR};
          },
          pointToLayer: function(feature,latlng){
            var baseballIcon = new L.divIcon({
              iconSize: [32, 37],
              iconAnchor: [16, 37],
              popupAnchor: [0, -28],
              className: "my-labels",
              html: "<div><font color="+String(feature.properties.COLOR)+">"+String(feature.properties.DISPLAYNAM)+"</font></div>"
            });
            return new L.Marker(latlng,{icon: baseballIcon})

            }
          }).addTo(grantedApplicationsFeature);
        })
    */
    //Reaching Moratorium Application
    // check pending application for code explanation
    let expiringApplications;
    $.getJSON("reaching", function (data) {

        expiringApplications = L.geoJson(data, {
            style: function (feature) {
                return {color: '#e6b400'};
            },
            onEachFeature: function onEachFeature(feature, layer) {
                layer.on({
                    mouseover: highlightTenement,
                    mouseout: function (tenement) {
                        expiringApplications.resetStyle(tenement.target);
                    },
                    click: zoomToTenement
                });
                layer.bindTooltip(function (layer) {
                    let div = L.DomUtil.create('div');

                    let handleObject = feature => typeof (feature) == 'object' ? JSON.stringify(feature) : feature;
                    let fields = ["DISPLAYNAM", "EXPIRYDATE", "AUTHORIS_1"];
                    let aliases = ["", "Expiring on:", "Company Name:"];
                    let table = '<table>' + String(fields.map((v, i) =>
                            `<tr>
							<th>${aliases[i]}</th>
							
							<td>${handleObject(layer.feature.properties[v])}</td>
						</tr>`).join(''))
                        + '</table>';
                    div.innerHTML = table;
                    return div
                }, {
                    
                    sticky: true,
                    className: "foliumtooltip"
                });
            }
        }).addTo(highlightExpiring);
    });

     //add image testing
    // Create a marker with the fireIcon and set its position
   // let marker = L.marker([-21, 153], { icon: fireIcon });

    // Add the marker to the map
    //marker.addTo(map);

    //Moratorium Application
    // check pending application for code explanation
    let moratoriumRanges = [];
    let moratoriumApplications;
    let moratoriumLegends;
    $.getJSON("moratorium", function (data) {

        moratoriumApplications = L.geoJson(data, {
            style: function (feature) {
                if (!(feature.properties.EXPIRY_RANGE in moratoriumRanges)) {
                    moratoriumRanges[feature.properties.EXPIRY_RANGE] = feature.properties.COLOR;
                }
                return {color: feature.properties.COLOR};
            },
            onEachFeature: function onEachFeature(feature, layer) {
                layer.on({
                    mouseover: highlightTenement,
                    mouseout: function (tenement) {
                        moratoriumApplications.resetStyle(tenement.target);
                    },
                    click: zoomToTenement
                });
                layer.bindTooltip(function (layer) {
                    let div = L.DomUtil.create('div');

                    let handleObject = feature => typeof (feature) == 'object' ? JSON.stringify(feature) : feature;
                    let fields = ["DISPLAYNAM", "EXPIRYDATE", "AUTHORIS_1"];
                    let aliases = ["", "Expired on:", "Company Name:"];
                    let table = '<table>' + String(fields.map((v, i) =>
                            `<tr>
							<th>${aliases[i]}</th>
							
							<td>${handleObject(layer.feature.properties[v])}</td>
						</tr>`).join(''))
                        + '</table>';
                    div.innerHTML = table;
                    return div
                }, {
                    
                    sticky: true,
                    className: "foliumtooltip"
                });
            }
        }).addTo(moratoriumApplicationsFeature);

        let morRanges = Object.keys(moratoriumRanges);
                morRanges = morRanges.sort();
                moratoriumLegends = L.control.Legend({
                    position: "bottomleft",
                    title: 'Expiry Date Ranges',
                    legends: [{
                        label: morRanges[0],
                        type: "polygon",
                        sides: 4,
                        color: moratoriumRanges[morRanges[0]],
                        fillColor: moratoriumRanges[morRanges[0]],
                        fillOpacity: 0.3,
                        weight: 2
                    }, {
                        label: morRanges[1],
                        type: "polygon",
                        sides: 4,
                        color: moratoriumRanges[morRanges[1]],
                        fillColor: moratoriumRanges[morRanges[1]],
                        fillOpacity: 0.3,
                        weight: 2
                    }, {
                        label: morRanges[2],
                        type: "polygon",
                        sides: 4,
                        color: moratoriumRanges[morRanges[2]],
                        fillColor: moratoriumRanges[morRanges[2]],
                        fillOpacity: 0.3,
                        weight: 2
                    }, {
                        label: morRanges[3],
                        type: "polygon",
                        sides: 4,
                        color: moratoriumRanges[morRanges[3]],
                        fillColor: moratoriumRanges[morRanges[3]],
                        fillOpacity: 0.3,
                        weight: 2
                    }, {
                        label: morRanges[4],
                        type: "polygon",
                        sides: 4,
                        color: moratoriumRanges[morRanges[4]],
                        fillColor: moratoriumRanges[morRanges[4]],
                        fillOpacity: 0.3,
                        weight: 2
                    },]
                });
    });

    // // Disasters
    let disasterRanges = [];
    let disasterApplications;
    let disasterLegends;
    $.getJSON("disasters", function (data) {
        console.log(data)
        getHazardsForMap(data, disastersApplicationsFeature, roadHazardApplicationsFeature, disasterRanges, disasterApplications, disasterLegends)
    });
    
   
    let hazardsLegend = L.control.Legend({
        position: "topleft",
        title: 'Hazards',
        legends: [{
            label: 'Fire',
            type: "polygon",
            sides: 3, 
            fillColor:'#FFDE59',
            weight: 2,
            color:'black',
        },{
            label: 'Flood',
            type: "polygon",
            sides: 100, 
            fillColor:'#5CE1E6',
            weight: 2,
            color:'black',
        },
        {
            label: 'Other',
            type: "polygon", 
            fillColor: '#FF5757',
            sides:5,
            weight: 2,
            color: 'black',
        }]

    });

    //hazardsLegend.addTo(disastersApplicationsFeature);
    //map.addControl(hazardsLegend);
    


    // Search Control
    var controlSearch = new L.Control.Search({
        layer: searchTenementFeature,
        propertyName: 'DISPLAYNAM', // dataset property to search
        initial: false,
        marker: false,
        textPlaceholder: 'Type EPM',
        // zoom to location
        moveToLocation: function (latlng, title, map) {
            map.fitBounds(latlng['layer']._bounds);
        },
    });

    pendingApplicationsFeature.addTo(searchTenementFeature);
    grantedApplicationsFeature.addTo(searchTenementFeature);
    roadHazardApplicationsFeature.addTo(searchTenementFeature);
    disastersApplicationsFeature.addTo(searchTenementFeature);

    // Zoom to feature on finding feature location
    controlSearch.on('search_locationfound',
        function (tenement, feature) {
            map.fitBounds(tenement.target.getBounds());
        });
    map.addControl(controlSearch);

    //Layers
    var baseLayers = {};

    var overlays_highlight = {
        "<span class='moratorium'>Moratorium </span>": moratoriumApplicationsFeature,
        "<span class='granted'>Pending Applications </span>": pendingApplicationsFeature,
        "<span class='pending'>Granted Exploration Permits </span>": grantedApplicationsFeature,
        "<span class='reaching'>Approaching Expiry </span>": expiringApplicationsFeature,
        "<span class='roads'>Road Hazards</span>": roadHazardApplicationsFeature,
        "<span class='hazards'>Hazards</span>": disastersApplicationsFeature,
    };

    // Create Layer Control for Map
    var layerControlHighlight = L.control.layers(baseLayers, overlays_highlight,
        {autoZIndex: true, position: "topright"})
        map.addControl(layerControlHighlight);      

    // when map layer is selected
    map.on('overlayadd', function (displayLayer) {
        displayLayer.layer.addTo(searchTenementFeature);
        drawnItems.clearLayers();

        switch(displayLayer.layer) {
            case grantedApplicationsFeature:
                    map.addControl(activeLegends);
                    map.removeLayer(expiringApplicationsFeature);
                    highlightExpiring.addTo(expiringApplicationsFeature);
                    layerControlHighlight.addOverlay(expiringApplicationsFeature,"<span class='reaching'>Approaching Expiry </span>")
                    break;

            case pendingApplicationsFeature:
                    map.addControl(pendingLegends);
                    break;

            case moratoriumApplicationsFeature:
                    map.addControl(moratoriumLegends);
                    break;
            case disastersApplicationsFeature:
                    map.addControl(hazardsLegend);
                    break;
          }
    });

    // when map layer is delesected
    map.on('overlayremove', function (displayLayer) {
        // remove deselected layer from search
        searchTenementFeature.removeLayer(displayLayer.layer);
        drawnItems.clearLayers()

        switch(displayLayer.layer) {
            case grantedApplicationsFeature:
                    map.removeControl(activeLegends);
                    layerControlHighlight.removeLayer(expiringApplicationsFeature);
                    searchTenementFeature.removeLayer(expiringApplicationsFeature);
                    expiringApplicationsFeature.clearLayers()
                    break;

            case pendingApplicationsFeature:
                    map.removeControl(pendingLegends);
                    break;

            case moratoriumApplicationsFeature:
                    map.removeControl(moratoriumLegends);
                    break;
            case disastersApplicationsFeature:
                    map.removeControl(hazardsLegend);
          }
    });

    // miles/km scale to display coordinates
    L.control.scale().addTo(map);

    // mouse coordinate tracker
    const Coordinates = L.Control.extend({
        onAdd: map => {
            const container = L.DomUtil.create("div");
            map.addEventListener("mousemove", tenement => {
                container.innerHTML = `
                      <p>Latitude: ${tenement.latlng.lat.toFixed(4)} | 
                        Longitude: ${tenement.latlng.lng.toFixed(4)}
                      </p>`;
            });
            return container;
        }
    });
    map.addControl(new Coordinates({position: "bottomleft"}));

    // Event when user create a shape on map
    map.on(L.Draw.Event.CREATED, function (drawnShape) {
        // Remove Existing Shapes
        drawnItems.clearLayers()

        // Get the user shape
        var userShape = drawnShape.layer;

        userShape.addTo(drawnItems);  //Add it to map

        epmGrantedList = [];  // data to go in grant table
        epmApplicationList = [];  // data to go in application table


        epmDisasterList = []
        epmRoadHazardList = []
        // Convert circle to polygon for the function ahead
        if (userShape instanceof L.Circle) {
            userShape = L.PM.Utils.circleToPolygon(userShape, 60);
        }
        // Convert the shape to geojson
        userShapeGJ = userShape.toGeoJSON();

        // Attach this to subscription form input on selection - allows for subscription
        $("#map_selection").val(JSON.stringify(userShape.toGeoJSON()))
  
        if (map.hasLayer(roadHazardApplicationsFeature)) {
            roadHazardApplicationsFeature.eachLayer(function (layer) {
                // check if EPM is within shape drawn
                if (turf.booleanIntersects(userShapeGJ, layer.toGeoJSON())) {
                    // check if the EPM application is granted
                    epmRoadHazardList.push(layer.options.feature)
                }
            });
        }
        if (map.hasLayer(disastersApplicationsFeature)) {
            disastersApplicationsFeature.eachLayer(function (layer) {
                // check if EPM is within shape drawn
                if (turf.booleanIntersects(userShapeGJ, layer.toGeoJSON())) {
                    // check if the EPM application is granted
                    epmDisasterList.push(layer.options.feature)
                }
            });
        }
        if (map.hasLayer(pendingApplicationsFeature)) {
            pendingApplications.eachLayer(function (layer) {
                // check if EPM is within shape drawn
                if (turf.booleanIntersects(userShapeGJ, layer.toGeoJSON())) {
                    // check if the EPM application is granted
                    if (layer.feature.properties['PERMITST_1'] == 'Granted') {
                        epmGrantedList.push(layer.feature.properties)
                    } else {
                        epmApplicationList.push(layer.feature.properties)
                    }
                }
            });
        }
        if (map.hasLayer(grantedApplicationsFeature)) {
            activeApplications.eachLayer(function (layer) {
                if (turf.booleanIntersects(userShapeGJ, layer.toGeoJSON())) {
                    if (layer.feature.properties['PERMITST_1'] == 'Granted') {
                        epmGrantedList.push(layer.feature.properties)
                    } else {
                        epmApplicationList.push(layer.feature.properties)
                    }
                }
            });
        }
        if (map.hasLayer(moratoriumApplicationsFeature)) {
            moratoriumApplications.eachLayer(function (layer) {
                if (turf.booleanIntersects(userShapeGJ, layer.toGeoJSON())) {
                    if (layer.feature.properties['PERMITST_1'] == 'Granted') {
                        epmGrantedList.push(layer.feature.properties)
                    } else {
                        epmApplicationList.push(layer.feature.properties)
                    }
                }
            });
        }

        //Headings in exisitng data
        let epmGrantedProperties = ['DISPLAYNAM', 'PERMITTY_1', 'PERMITST_1', 'PERMITST_2', 'LODGEDATE', 'APPROVEDAT', 'EXPIRYDATE', 'AUTHORIS_1',
            'NATIVETITL', 'PERMITMINE', 'PERMITPURP', 'PERMITNAME', 'PERMITNUMB', 'PERMITTY_2', 'PERMITID'];

        let epmGrantedRows = [];
        //Add revelant data covered by user shape as rows
        for (let idx in epmGrantedList) {
            let rowValue = {};
            // Creating dictionary of dataset property and its value
            for (let col in epmGrantedProperties) {
                rowValue[epmGrantedProperties[col]] = epmGrantedList[idx][epmGrantedProperties[col]];
            }
            epmGrantedRows.push(rowValue);
        }

        // Repopulate the table
        epmGrantedTable.clear().draw();
        epmGrantedTable.rows.add(epmGrantedRows).draw();

        //Headings in exisitng data
        let epmApplicationProperties = ['DISPLAYNAM', 'PERMITTY_1', 'PERMITST_1', 'PERMITST_2', 'LODGEDATE', 'AUTHORIS_1',
            'NATIVETITL', 'PERMITMINE', 'PERMITPURP', 'PERMITNAME', 'PERMITNUMB', 'PERMITTY_2', 'PERMITID'];

        let epmApplicationRows = [];
        //Display revelant data covered by user shape
        for (let idx in epmApplicationList) {
            let rowValue = {};
            for (let col in epmApplicationProperties) {
                rowValue[epmApplicationProperties[col]] = epmApplicationList[idx][epmApplicationProperties[col]];
            }
            epmApplicationRows.push(rowValue);
        }

        // Repopulate the table
        epmApplicationTable.clear().draw();
        epmApplicationTable.rows.add(epmApplicationRows).draw();
 
        let epmNaturalDisasterRows = [];
        //Display revelant data covered by user shape
        for (let idx in epmDisasterList) {
            let rowValue = {};
            if(epmDisasterList[idx].api_type === "escad"){

                let severity;
                let sumOfVehicles = epmDisasterList[idx].properties.VehiclesAssigned + epmDisasterList[idx].properties.VehiclesOnScene + epmDisasterList[idx].properties.VehiclesOnRoute
                severity = sumOfVehicles < 2 ? "Minor" : sumOfVehicles < 6 ? "Moderate" : "Severe"

                rowValue["WARNINGID"] = epmDisasterList[idx].api_identifier;
                rowValue["NAME"] = epmDisasterList[idx].properties.Locality + " " + epmDisasterList[idx].properties.GroupedType;
                rowValue["TYPE"] = epmDisasterList[idx].properties.GroupedType;
                rowValue["INITIALDATE"] = new Date(epmDisasterList[idx].properties.Response_Date).toLocaleDateString()
                rowValue["LASTUPDATED"] = new Date(epmDisasterList[idx].properties.LastUpdate).toLocaleDateString();
                rowValue["LOCATION"] = epmDisasterList[idx].properties.Location;
                rowValue["SEVERITY"] = severity;
                rowValue["LOCALITY"] = epmDisasterList[idx].properties.Locality;
            } else if(epmDisasterList[idx].api_type === "water"){
                rowValue["WARNINGID"] = epmDisasterList[idx].api_identifier;
                rowValue["NAME"] = epmDisasterList[idx].name;
                rowValue["TYPE"] = "Water Level Warning";
                rowValue["INITIALDATE"] = new Date(epmDisasterList[idx].properties.ObservationTime).toLocaleDateString();
                rowValue["LASTUPDATED"] = new Date(epmDisasterList[idx].properties.FMETimestamp).toLocaleDateString();
                rowValue["LOCATION"] = epmDisasterList[idx].properties.Name;
                rowValue["SEVERITY"] = epmDisasterList[idx].properties.Class;
                rowValue["LOCALITY"] = epmDisasterList[idx].properties.Stream;
            }
            epmNaturalDisasterRows.push(rowValue);
        }
        let epmRoadHazardRows = [];
        //Display revelant data covered by user shape
        for (let idx in epmRoadHazardList) {
            let rowValue = {};
            console.log(epmRoadHazardList[idx])
            try{
                rowValue["WARNINGID"] = epmRoadHazardList[idx].api_identifier;
                rowValue["NAME"] = epmRoadHazardList[idx].name;
                rowValue["TYPE"] = epmRoadHazardList[idx].properties.event_type;
                rowValue["INITIALDATE"] = new Date(epmRoadHazardList[idx].properties.duration.start).toLocaleDateString();
                rowValue["LASTUPDATED"] = new Date(epmRoadHazardList[idx].properties.last_updated).toLocaleDateString();
                rowValue["LOCATION"] = epmRoadHazardList[idx].properties.road_summary.road_name + ", " + epmRoadHazardList[idx].properties.road_summary.locality + ", " + epmRoadHazardList[idx].properties.road_summary.postcode;
                rowValue["SEVERITY"] = epmRoadHazardList[idx].properties.impact.impact_subtype + " - " + epmRoadHazardList[idx].properties.impact.direction;
                rowValue["LOCALITY"] = epmRoadHazardList[idx].properties.road_summary.district;
            }
            catch(e){
                console.log(e)
            }

            epmRoadHazardRows.push(rowValue);
        }

        // Repopulate the table
        epmDisasterTable.clear().draw();
        epmDisasterTable.rows.add(epmNaturalDisasterRows).draw();
        epmDisasterTable.rows.add(epmRoadHazardRows).draw();

        // If shape drawn overlaps with existing data on map
        if (epmGrantedTable.rows().count() + epmApplicationTable.rows().count() + epmDisasterTable.rows().count() > 0) {
            // Change the display text to results
            $("#flip").empty();
            $("#flip").append(`Results <span class="badge rounded-pill">${epmGrantedTable.rows().count() + epmApplicationTable.rows().count() + epmDisasterTable.rows().count()}</span>`);
            // Add number to grant tab
            $("#nav-grant-tab").empty();
            $("#nav-grant-tab").append(`EPM Grants <span class="badge rounded-pill">${epmGrantedTable.rows().count()}</span>`);
            // add number to display tab
            $("#nav-application-tab").empty();
            $("#nav-application-tab").append(`EPM Applications <span class="badge rounded-pill">${epmApplicationTable.rows().count()}</span>`);
            // add number to display tab
            $("#nav-natural-disasters-tab").empty();
            $("#nav-natural-disasters-tab").append(`EPM Natural Disasters <span class="badge rounded-pill">${epmDisasterTable.rows().count()}</span>`);
            
            // Slide down the table to display results
            $("#panel").slideDown();
        } else {
            $("#flip").empty();
            $("#flip").append(`Select an EPM displayed area to see results`);
            $("#panel").slideUp();
        }
    });

    $('#sidebarToggleButton').on('click',function (e) {     
        setTimeout(function(){map.invalidateSize()}, 200);
    });
    
});