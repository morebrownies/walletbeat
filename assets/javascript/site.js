var bitcoins = 0;
var currentPrice = 0;
var lastPrice = 0;
var dollars = 0;
var lastDollars = 0;
var historicalPrices = [];
var unconfirmedBalance = 0;
var i = 0;
var chartsGenerated = false;
var k = 0;
var b = 0;
var api_key = '831f090e60d604ff18b9633bbec371e5';
var currentPriceChart;
var totalBitcoinsChart;
var totalValueChart;
var keys = getParameterByName('keys');
var addrs = keys.split(',');

// if (window.location.protocol != "https:")
//     window.location.href = "https:" + window.location.href.substring(window.location.protocol.length);

function saveDashboardToLocalStorage(){
  // if (localStorage.getItem('dashboards') === null) {
  //   var tmpAddrs = new Array(addrs.toString());
  //   localStorage['dashboards'] = JSON.stringify(tmpAddrs);
  // }else{
  //   var previousDashboards = JSON.parse(localStorage['dashboards']);
  //   previousDashboards.push(addrs.toString());
  //   localStorage['dashboards'] = previousDashboards;
  // }
}

function checkKey(key){
  if ((key.length >= 27 && key.length <= 34) && (key.charAt(0) === "1" || key.charAt(0) === "3" ) ){
    return true;
  }else{
    return false;
  }
}

function commaSeparateNumber(val){
  while (/(\d+)(\d{3})/.test(val.toString())){
    val = val.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");
  }
  return val;
}

function nFormatter(num, decimals) {
   if (num >= 1000000000) {
      return (num / 1000000000).toFixed(1).replace(/\.0$/, '') + 'G';
   }
   if (num >= 1000000) {
      return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
   }
   if (num >= 1000) {
      return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
   }
   if (num >= 0) {
      if (decimals === 4){
        return (num).toFixed(4).replace(/\.0$/, '');
      }else{
        return (num).toFixed(2).replace(/\.0$/, '');
      }
   }
   return num;
}

function initialLoad() {
  var newDashboard = localStorage['create-dashboard'];
  var addedSecondWallet = localStorage['added-second-wallet'];
  if (newDashboard === "true"){
    showOverlay();
    localStorage.setItem('create-dashboard', false);
  }

  if (addedSecondWallet === "true"){
    $('.adding-new-key').hide();
    $('.you-got-it').show();
    showOverlay();
    localStorage.setItem('added-second-wallet', false);
  }
}

function getParameterByName(name) {
  name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
  var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
  results = regex.exec(location.search);
  return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

function showOverlay(){
  $('.overlay').fadeIn();
  $('.new-key').show();
  $('.input-public-key').focus();
}

$(function() {
  $( document ).ready(function() {
    initialLoad();
    fetch();
    var mainFetch = setInterval(fetch, 2500);
    displaySpecificKeys();

  $(document).keyup(function(e) {
    if (e.keyCode == 13) {
      if ($('.input-public-key').is(":focus")){
        if ( checkKey($('.input-public-key').val()) == true && $.inArray($('.input-public-key').val(), addrs) == -1 ){
          addrs.push($('.input-public-key').val());
          localStorage.setItem('added-second-wallet', true);
          window.location.href = "dashboard.html?keys=" + addrs.join(',');
        }else{
          $(".input-holder").effect("shake", {
            times: 2,
            distance: 6
          }, 500);             
        }
      }
    }

    if (e.keyCode == 27) {
      if ($('.overlay').is(':visible')){
        hideOverlay();
        return false;
      }      
    }
  });

  function createDashboard() {
    if ( checkKey($('.input-public-key').val()) == true && $.inArray($('.input-public-key').val(), addrs) == -1 ){
      addrs.push($('.input-public-key').val());
      localStorage.setItem('added-second-wallet', true);
      window.location.href = "dashboard.html?keys=" + addrs.join(',');
    }else{
      $(".input-holder").effect("shake", {
        times: 2,
        distance: 6
      }, 500); 
    }      
  }

  $('.close-overlay, .overlay').click(function(){
    hideOverlay();
  });

  $(".add-another-wallet").click(function(){
    $('.you-got-it').hide();
    $('.adding-new-key').show();
    $('.overlay-heading').html('Add another address to your dashboard');    
    showOverlay();
  });

  $("#button-add-key").click(function(){
    createDashboard();
  });

  function hideOverlay() {
    $('.new-key').fadeOut('fast');
    $('.overlay').fadeOut('fast');      
  }

  function displaySpecificKeys() {
    $(".stats").css("margin-top", "0");     
  }


  function generateCurrentPriceChart() {
    var options = {
      credits: { enabled: false },                   
      exporting: { enabled: false },
      legend: { enabled: false },
      title: { enabled: false, text: '' },
      chart: {
        renderTo: 'current-price-chart',
        backgroundColor: "#2A2A2A",
        type: 'spline',
        marginLeft: -3,
        marginRight: -3,
        events: {
          load: function() {
            var series = this.series[0];
            setInterval(function() {
              if (currentPrice != lastPrice){
                series.addPoint({x: i, y: currentPrice, date: moment().format('MMM Do h:mm a')}, true, true);
                i = i + 1;
              }
            }, 2500);
          }
        }
      },
      xAxis: {
        lineWidth: 0,
        minorGridLineWidth: 0,
        lineColor: 'transparent',
        minorTickLength: 0,
        tickLength: 0,               
        gridLineWidth: '0',
        labels: {
          enabled: false
        }
      },
      yAxis: {
          gridLineWidth: '0',                
          labels: { enabled: false },                
          title: { enabled: false
          },
          plotLines: [{
              value: 0,
              width: 0,
              color: '#000'
          }]
      },
      tooltip: {
        formatter: function() {
          return this.point.date + ' - $' + Highcharts.numberFormat(this.y, 2);
        }
      },
      plotOptions: {
        spline: {
          lineWidth: 3,
          states: {
            hover: {
              lineWidth: 3
            }
          },
          marker: {
            enabled: false
          }
        }
      },
      series: [{
        name: '',
        color: '#6A8C43',
        data: (function() {
          var data = [];
          $.each( historicalPrices, function( index, value ){
            i = index;
            data.push({
              x: i, 
              y: parseFloat(value.split(',')[1]),
              date: moment(value.split(',')[0]).format('MMM Do h:mm a')
            });
          });
          return data;
        })()
      }]
    };

    currentPriceChart = new Highcharts.Chart(options);
  }

  function generateTotalBitcoinsChart(){
    var options = {
      credits: { enabled: false },                   
      exporting: { enabled: false },
      legend: { enabled: false },
      title: { enabled: false, text: '' },          
        chart: {
          backgroundColor: "#2A2A2A",
          renderTo: "total-bitcoins-chart",
          type: 'spline',
          marginLeft: -3,
          marginRight: -3,
          events: {
            load: function() {
              var series = this.series[0];
              setInterval(function() {
                if (bitcoins != lastBitcoinPrice){
                  series.addPoint([b, bitcoins], true, true);
                  b = b + 1;
                }
              }, 2500);
            }
          }
        },
        xAxis: {
          lineWidth: 0,
          minorGridLineWidth: 0,
          lineColor: 'transparent',
          minorTickLength: 0,
          tickLength: 0,               
          gridLineWidth: '0',
          labels: {
            enabled: false
          }
        },
        yAxis: {
          gridLineWidth: '0',                
          labels: { enabled: false },                
          title: { enabled: false
          },
          plotLines: [{
            value: 0,
            width: 0,
            color: '#000'
          }]
        },
        tooltip: {
          formatter: function() {
            return Highcharts.numberFormat(this.y, 4) + " BTC";
          }
        },
        plotOptions: {
          spline: {
            lineWidth: 3,
            states: {
              hover: {
                lineWidth: 3
              }
            },
            marker: {
              enabled: false
            }
          }
        },
        series: [{
          name: '',
          color: '#6A8C43',
          data: (function() {
            var data = [];
            for (b = 0; b <= 20; b++) {
              b = b;
              data.push({
                x: b,
                y: bitcoins
              });
            }
            return data;
          })()
        }]
    };

    totalBitcoinsChart = new Highcharts.Chart(options);
  }

  function generateTotalValueChart(){
    var options = {
      credits: { enabled: false },                   
      exporting: { enabled: false },
      legend: { enabled: false },
      title: { enabled: false, text: '' },       
      chart: {
        backgroundColor: "#2A2A2A",
        renderTo: "total-value-chart",
        type: 'spline',
        marginLeft: -3,
        marginRight: -3,
        events: {
          load: function() {
            var series = this.series[0];
            setInterval(function() {
              if (dollars != lastDollars || bitcoins != lastBitcoinPrice){
                series.addPoint({x: k, y: dollars, date: moment().format('MMM Do h:mm a')}, true, true);
                k = k + 1;
              }
            }, 2500);
          }
        }
      },
      xAxis: {
        lineWidth: 0,
        minorGridLineWidth: 0,
        lineColor: 'transparent',
        minorTickLength: 0,
        tickLength: 0,               
        gridLineWidth: '0',
        labels: {
          enabled: false
        }
      },
      yAxis: {
        gridLineWidth: '0',                
        labels: { enabled: false },                
        title: { enabled: false
        },
        plotLines: [{
          value: 0,
          width: 0,
          color: '#000'
        }]
      },
      tooltip: {
        formatter: function() {
          return this.point.date + ' - $' + Highcharts.numberFormat(this.y, 2);
        }
      },
      plotOptions: {
          spline: {
              lineWidth: 3,
              states: {
                  hover: {
                      lineWidth: 3
                  }
              },
              marker: {
                  enabled: false
              }
          }
      },
      series: [{
        name: '',
        color: '#6A8C43',
        data: (function() {
          var data = [];
          $.each( historicalPrices, function( index, value ){
            k = index;
            data.push({
              x: k, 
              y: value.split(',')[1] * bitcoins,
              date: moment(value.split(',')[0]).format('MMM Do h:mm a')
            });
          });
          return data;
        })()
      }]
    };

    totalValueChart = new Highcharts.Chart(options);
  }

  function generateTotalTransactionsChart(){
    $('.total-transactions .chart').highcharts({
        chart: {
            marginLeft: -3,
            marginRight: -3,
            marginBottom: 0,
            backgroundColor: "#2A2A2A",
            type: 'column'
        },
        title: {
            text: ''
        },
        subtitle: {
            text: ''
        },
        xAxis: {
          lineWidth: 0,
          minorGridLineWidth: 0,
          lineColor: 'transparent',
          minorTickLength: 0,
          tickLength: 0,               
          gridLineWidth: '0',
          labels: {
            enabled: false
          }
        },
        yAxis: {
          gridLineWidth: '0',
          labels: { enabled: false },                
          title: { enabled: false
          },
          plotLines: [{
              value: 0,
              width: 0,
              color: '#000'
          }]
        },
        tooltip: {
          formatter: function() {
            return "";
          }
        },
        plotOptions: {
            bar: {
                dataLabels: {
                    enabled: true
                }
            }
        },
        legend: {
            enabled: false
        },
        exporting: {
            enabled: false
        },
        credits: {
            enabled: false
        },
        series: [{
          name: '',
          borderWidth: 0,
          color: '#6A8C43',
          data: [3, 7, 2, 2, 0, 4]
        }]
    });
  }

  function fetchWallet(){
    var total = 0;
    $.ajax({
      url: 'https://api.chain.com/v1/bitcoin/addresses/' + addrs,
      type: 'GET',
      beforeSend: function (xhr) {
        xhr.setRequestHeader ('Authorization', 'Basic ' + btoa(api_key));
      },
      success: function(data) {
        lastBitcoinPrice = bitcoins;
        bitcoins = 0;
        unconfirmedBalance = 0;
        $("#wallets").empty();
        totalBitcoins(data['balance']);
        totalUnconfirmedBalance(data['unconfirmed_balance']);
        outputWallet(data);
        fetchCurrentPrice();
      }
    });  
  }

  function fetchWallets(){
    var total = 0;
    $.ajax({
      url: 'https://api.chain.com/v1/bitcoin/addresses/' + addrs,
      type: 'GET',
      beforeSend: function (xhr) {
        xhr.setRequestHeader ('Authorization', 'Basic ' + btoa(api_key));
      },
      success: function(data) {
        lastBitcoinPrice = bitcoins;
        bitcoins = 0;
        unconfirmedBalance = 0;
        $("#wallets").empty();
        $.each(data, function(key,val){
          totalBitcoins(val['balance']);
          totalUnconfirmedBalance(val['unconfirmed_balance']);
          outputWallet(val);
        });            
        fetchCurrentPrice();
      }
    });  
  }

  function fetchTransactions(){
    var total = 0;
    $.ajax({
      url: 'https://api.chain.com/v1/bitcoin/addresses/' + addrs + '/transactions',
      type: 'GET',
      beforeSend: function (xhr) {
        xhr.setRequestHeader ('Authorization', 'Basic ' + btoa(api_key));
      },
      success: function(data) {
        $("#transactions").empty();
        if (data.length > 0){
          $(".no-transactions").hide();
          $.each(data, function(key,val){
            if (val['confirmations'] == 0){
              var confirmations = "Unconfirmed"
            }else{
              var confirmations = val['confirmations'] + " confirmations";
            }
            $("#transactions").append('<li style="clear: both; height: 14px"><span class="ui-position-float-left">Received</span> <span class="ui-position-float-left ui-position-margin-left-60px">' + nFormatter(val['amount'] / 100000000, 4) + ' BTC</span> <span class="ui-position-float-left ui-position-margin-left-60px">' + confirmations + '</span> <span class="ui-position-float-right">' + moment(val['block_time']).fromNow() + '</span></li>');
          });
        }
      }
    });      
  }

  function totalBitcoins(amount){
    bitcoins = bitcoins + (amount / 100000000);
  }

  function totalUnconfirmedBalance(amount) {
    unconfirmedBalance = unconfirmedBalance + (amount / 100000000);
  }

  function fetchCurrentPrice(){
    $.ajax({
      dataType: "json",
      url: 'https://api.coindesk.com/v1/bpi/currentprice.json',
      type: 'GET',
      success: function (data) {
        lastPrice = currentPrice;
        currentPrice = parseFloat(data.bpi.USD['rate']);
        // Math.floor((Math.random() * 10) + 1)
        document.title = nFormatter(currentPrice) + ' USD/BTC';
        outputData();
        fetchHistoricalPrices();
        calculateTotal();
      }
    });
  }

  function fetchHistoricalPrices(){
    $.ajax({
      dataType: "json",
      url: 'https://api.coindesk.com/v1/bpi/historical/close.json',
      type: 'GET',
      success: function (data) {
        $.each(data.bpi, function(key,val){
          historicalPrices.push(key + ',' + val);
         });
        if(!chartsGenerated){
          generateCurrentPriceChart();
          generateTotalBitcoinsChart();
          generateTotalValueChart();
          generateTotalTransactionsChart();
          chartsGenerated = !chartsGenerated;
        }
      }
    });
  }

  function calculateTotal(){
    lastDollars = dollars;
    dollars = 0;
    dollars = (currentPrice * bitcoins);
    outputData();
  }

  function outputWallet(wallet){
    $("#wallets").append('<li style="clear: both; height: 14px"><div class="ui-position-float-left" style="width: 360px"><a href="dashboard.html?keys=' + wallet['hash'] + '" target="_blank">' + wallet['hash'] + '</a></div> <div class="ui-position-float-left">' + nFormatter(wallet['balance'] / 100000000, 4) + ' BTC</div> <div class="ui-position-float-right">$' + nFormatter((wallet['balance'] / 100000000) * currentPrice) + ' </div></li>');
  }

  function fetch() {
    if (addrs.length > 1) {
      fetchWallets();
    }else{
      fetchWallet();
    }
    fetchTransactions();
  }

  function outputData(){
    $('.total-transactions .value').html('More stats');
    $('.current-price .value').text('$' + nFormatter(currentPrice));
    $('.total-value .value').text('$' + nFormatter(dollars));
    if(unconfirmedBalance > 0){
      $('.total-bitcoins .value').html("<span class='ui-font-size-15px'>(" + nFormatter(unconfirmedBalance, 4) + " unconfirmed)</span> " + nFormatter(bitcoins));        
    }else{
      $('.total-bitcoins .value').html(nFormatter(bitcoins, 4));
    }
  }
});
});