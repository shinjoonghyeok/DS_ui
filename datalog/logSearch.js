(function() {
    app.register.controller('DatalogTransactionSearchController', DatalogTransactionSearchController);
  
    function DatalogTransactionSearchController($scope, $q, $location, $http, socket, $filter, $state, $element, $window, serviceLogdb, $stateParams, serviceSession, serviceAuth, USER_LEVELS, $interval, $timeout, $templateCache, filterFilter, serviceNotification, serviceLogdbManagement) {
      console.log(":: Transaction Page ::");

      $(function() {
        $('#startDatePicker,#endDatePicker').datetimepicker({
          sideBySide: true,
          format: 'YYYY-MM-DD HH:mm:ss'
        });
  
        $('#startTimePicker,#endTimePicker').datetimepicker({
          sideBySide: true,
          format: 'HH:mm:ss'
        });

        $('#searchForm').keydown(function(e) {
          if(e.keyCode == 13) {
            $scope.searchTotalLog('fulltext');
          }
        });

        $('#reSearchForm').keydown(function(e) {
          if(e.keyCode == 13) {
            $scope.reSearchAction();
          }
        });

        $('#searchServiceIDForm').keydown(function(e) {
          if(e.keyCode == 13) {
            $scope.findServiceIDAction('id');
          }
        });

        $('#searchServiceNameForm').keydown(function(e) {
          if(e.keyCode == 13) {
            $scope.findServiceIDAction('name');
          }
        });

        
      });

      $timeout(function() {
        $scope.showTest = true;
      },2000)

      $scope.isSearchCondition = true;
      $scope.isReSearchCondition = false;

      $scope.resizeMode = "OverflowResizer";
      var lastQueryID = null;
      var orgQueryID = null;
  
      $scope.processTime = 0;
  
      $scope.btnFlag = "ready";
      $scope.btnErrFlag = "ready";
      $scope.searchSignValue = [
        "포함",
        "==",
        "!=",
        "(숫자)==",
        "이하",
        "이상",
      ];
      var logSearchInstance = null;
      var logSearchQuery;

      var irsSearchInstance = null;
      var irsSearchQuery;

      var auditImportInstance = null;
      var auditImportQuery;

      $scope.userSearchLimit = 100000;    //10만건 Default
      var searchLimitInstance = null;
      var searchLimitQuery;

      var errorSearchInstance = null;
      var errorSearchInstance;

      var searchWormInstance  = null;
      var searchWormQuery;

      var tempReSearchInstance = null;
      var tempReSearchQuery;
  
      $scope.searchStartDate = getNowDateTimeStart(1);
      $scope.searchEndDate = getNowDateTimeEnd(1);
  
      $scope.logSearchForm = new Array();
      $scope.searchField = new Array();
      $scope.searchCondition = new Array();
      $scope.searchValue = new Array();

      $scope.selectedRow = null;
      $scope.selectedPage = null;

      $scope.errorSelectedRow = null;
      $scope.errorSelectedPage = null;

      $scope.reSelectedRow = new Array();
      $scope.reSelectedPage = new Array();

      $scope.searchAccount = "";
      $scope.searchServiceId = "";
      $scope.searchArea = "";
      $scope.searchCannelId = "";
      $scope.searchCategory = "";
      $scope.searchUserIp = "";
      $scope.searchMiddleIp = "";

      $scope.searchDurationType = "eq";
      $scope.searchDurationValue = "";

      $scope.searchLimit = 0;
      $scope.searchPage = 100;
      $scope.searchErrorPage = 100;
      $scope.logSearchPaginationArray = [];

      $scope.showSelectFieldHeight = true;

      var startTimeStamp = "";
      var endTimeStamp = "";

      $scope.logSearchType = "basic";
      $scope.tdWidth = "200";
      $scope.isErrorSearch = false;

      var parseCount = 80;
  
      $scope.tableTransaction = "daishinParse_enc";
      $scope.lookupIRS = "daishinIRS";

      $scope.selectedField = 0;
      $scope.selectFieldList = function() {
        $scope.defineFieldInfoList[$scope.selectedField].flag = true;
        // $window.localStorage.fieldsFilter = Base64.encode(JSON.stringify($scope.defineFieldInfoList));
      }
      $scope.unselectFieldList = function(idx) {
        $scope.defineFieldInfoList[idx].flag = false;
        // $window.localStorage.fieldsFilter = Base64.encode(JSON.stringify($scope.defineFieldInfoList));
      }

      $scope.defineFieldInfoListORG = [
        { key:'처리유형', name:'처리유형', flag: true },
        { key:'업무영역', name:'업무영역', flag: true },
        { key:'호스트이름', name:'호스트이름', flag: true },
        { key:'Client_Time', name:'Client Time', flag: true },
        { key:'로그발생시각', name:'로그발생시각', flag: true },
        { key:'시간간격', name:'시간간격', flag: true },
        { key:'서비스식별자', name:'서비스식별자', flag: true },
        { key:'서비스식별자(한글)', name:'서비스식별자(한글)', flag: true },
        { key:'계좌번호', name:'계좌번호/통신ID', flag: true },
        { key:'MachineID', name:'MachineID', flag: true },
        { key:'사용자IP', name:'사용자IP', flag: true },
        { key:'맥주소', name:'맥주소', flag: true },
        { key:'화면번호', name:'화면번호', flag: true },
        { key:'고유식별번호', name:'고유식별번호', flag: true },
        { key:'접속자부서', name:'접속자부서', flag: true },
        { key:'조작자사번', name:'조작자사번', flag: true },
        { key:'메시지코드', name:'메시지코드', flag: true },
        { key:'메시지영역', name:'메시지영역', flag: true },
      ]

      $scope.defineFieldInfoList = [
        { key:'처리유형', name:'처리유형', flag: true },
        { key:'업무영역', name:'업무영역', flag: true },
        { key:'호스트이름', name:'호스트이름', flag: true },
        { key:'Client_Time', name:'Client Time', flag: true },
        { key:'로그발생시각', name:'로그발생시각', flag: true },
        { key:'시간간격', name:'시간간격', flag: true },
        { key:'서비스식별자', name:'서비스식별자', flag: true },
        { key:'서비스식별자(한글)', name:'서비스식별자(한글)', flag: true },
        { key:'계좌번호', name:'계좌번호/통신ID', flag: true },
        { key:'MachineID', name:'MachineID', flag: true },
        { key:'사용자IP', name:'사용자IP', flag: true },
        { key:'맥주소', name:'맥주소', flag: true },
        { key:'화면번호', name:'화면번호', flag: true },
        { key:'고유식별번호', name:'고유식별번호', flag: true },
        { key:'접속자부서', name:'접속자부서', flag: true },
        { key:'조작자사번', name:'조작자사번', flag: true },
        { key:'메시지코드', name:'메시지코드', flag: true },
        { key:'메시지영역', name:'메시지영역', flag: true },
      ]

      // if(typeof $window.localStorage.fieldsFilter === 'undefined') {
      //   $window.localStorage.fieldsFilter = Base64.encode(JSON.stringify($scope.defineFieldInfoList));
      // }
      // else {
      //   try {
      //     $scope.defineFieldInfoList = JSON.parse(Base64.decode($window.localStorage.fieldsFilter));
      //   }
      //   catch {
      //     $scope.defineFieldInfoList = $scope.defineFieldInfoListORG;
      //     $window.localStorage.fieldsFilter = Base64.encode(JSON.stringify($scope.defineFieldInfoListORG));
      //   }
        
      // }

      $scope.defineSearchList = [
        // {"key":"hostName", "value":"호스트이름"},
        {"key":"USERDEPT", "value":"접속자부서"},
        {"key":"USEROPEREMPID", "value":"조작자사번"},
        {"key":"SSOAUTH", "value":"인증정보"},
        // {"key":"GUID", "value":"고유식별번호"},
        {"key":"MAC", "value":"맥주소"},
        {"key":"MESSAGECODE", "value":"메시지코드"},
        {"key":"MESSAGEBODY", "value":"메시지영역"},
      ];
      $scope.defineReSearchList = [
        {"key":"처리유형", "value":"처리유형"},
        {"key":"업무영역", "value":"업무영역"},
        {"key":"호스트이름", "value":"호스트이름"},
        {"key":"서비스식별자", "value":"서비스식별자"},
        // {"key":"서비스식별자(한글)", "value":"서비스식별자(한글)"},
        {"key":"화면번호", "value":"화면번호"},
        {"key":"접속자부서", "value":"접속자부서"},
        {"key":"조작자사번", "value":"조작자사번"},
        {"key":"SSOAUTH", "value":"인증정보"},
        {"key":"고유식별번호", "value":"고유식별번호"},
        {"key":"사용자IP", "value":"사용자IP"},
        {"key":"맥주소", "value":"맥주소"},
        {"key":"계좌번호", "value":"계좌번호/통신ID"},
        {"key":"메시지코드", "value":"메시지코드"},
        {"key":"메시지영역", "value":"메시지영역"},
      ];

      var defineAuditField = {
        "searchstartDate":"시작일자",
        "searchEndDate":"종료일자",
        "searchType":"검색유형",
        "searchServiceId":"서비스ID",
        "searchAccount":"계좌번호",
        "searchArea":"업무영역",
        "searchCannelId":"채널ID",
        "searchCategory":"처리유형",
        "searchUserIp":"사용자IP",
        "searchMiddleIp":"경유IP",
        "userSearchLimit":"검색제한",
        "hostName":"호스트이름",
        "USERDEPT":"접속자부서",
        "MAC":"맥주소",
        "MESSAGECODE":"메시지코드",
        "MESSAGEBODY":"메시지영역",
        "researchCounter":"재검색횟수",
        "guid":"고유식별번호",
        "ctime":"Client Time",
        "searchCount":"검색건수",
        "searchDurationType": "지연시간검색조건",
        "searchDurationValue": "지연시간검색값"
      };

      /* ---------------------------------------------------------------------------------------------------------------------
      * Pagination Set Start
      * ---------------------------------------------------------------------------------------------------------------------*/
      $scope.logSearchPageSize = $scope.searchPage;
      $scope.logSearchTotalCount = 0;
      $scope.logSearchPagerPageSize = 10;
      $scope.logSearchCurrentStart = 1;
      $scope.logSearchCurrentPage = 1;
      $scope.logSearchJumpNumber = 1;
  
      function makeLogSearchPaginationInfo() {
        $scope.logSearchPaginationArray = [];
        var arrayCount = 0;
  
        if ($scope.logSearchTotalCount > 0)
          $scope.logSearchPaginationCount = Math.ceil($scope.logSearchTotalCount / $scope.logSearchPageSize);
        else
          $scope.logSearchPaginationCount = 1;
  
        var showPageNumber = 0;
  
        if ($scope.logSearchPaginationCount > $scope.logSearchPagerPageSize) arrayCount = $scope.logSearchPagerPageSize;
        else arrayCount = $scope.logSearchPaginationCount;
  
        for (var i = 0; i < arrayCount; i++) {
          $scope.logSearchShowPage = $scope.logSearchCurrentStart + i;
          if ($scope.logSearchPaginationCount >= $scope.logSearchShowPage)
            $scope.logSearchPaginationArray.push($scope.logSearchShowPage);
          else break;
        }
      }
  
      $scope.logSearchPageChanged = function(number) {
        var idx = number - 1;
        $scope.logSearchCurrentPage = number;
        $scope.logSearchCurrentStart = (Math.ceil($scope.logSearchCurrentPage / $scope.logSearchPagerPageSize) - 1) * $scope.logSearchPagerPageSize + 1;
  
        logSearchInstance.getResult(idx * $scope.logSearchPageSize, $scope.logSearchPageSize, function(message) {
          var fieldTypeArray = new Array();
          var fieldOrderArray = new Array();
          var tempArray = new Array();
          $scope.logSearchFields = new Array();
  
          for (var key in message.body.field_types) {
            if (tempArray.findIndex(obj => obj.key == key) === -1) tempArray.push({"key":key,"val":message.body.field_types[key]});
            if(key!="_table") fieldTypeArray.push(key);
            if(key=="_id" || key=="_time") fieldOrderArray.push(key);
          }
          fieldTypeArray.sort();
          if(typeof message.body.field_order != "undefined") {
            for(var i=0; i<message.body.field_order.length; i++) {
              if(message.body.field_order[i]!="_id" && message.body.field_order[i]!="_time" && message.body.field_order[i]!="_table") fieldOrderArray.push(message.body.field_order[i]);
            }
          }
  
          var diffArray = array_diff(fieldTypeArray,fieldOrderArray);
          var finalArray = union(fieldOrderArray,diffArray);
  
  
          for(var i=0;i<finalArray.length; i++) {
            var fieldData = tempArray.find(obj => obj.key === finalArray[i]);
            if(typeof fieldData !== "undefined") $scope.logSearchFields.push(fieldData);
          }
  
          $scope.tdWidth = $scope.tableWidth / $scope.logSearchFields.length;
          if($scope.tdWidth < 100) $scope.tdWidth = 100;
          $scope.logSearchResult = message.body.result;
          $scope.$apply()
        });
        makeLogSearchPaginationInfo();
      }
  
      $scope.logSearchJumpNext = function() {
        $scope.logSearchCurrentPage = $scope.logSearchCurrentPage + $scope.logSearchPagerPageSize;
        if ($scope.logSearchCurrentPage > $scope.logSearchPaginationCount) {
          $scope.logSearchCurrentPage = $scope.logSearchPaginationCount;
        }
        $scope.logSearchPageChanged($scope.logSearchCurrentPage);
      }
  
      $scope.logSearchPageNext = function() {
        $scope.logSearchCurrentPage = $scope.logSearchCurrentPage + 1;
        if ($scope.logSearchCurrentPage > $scope.logSearchPaginationCount) {
          $scope.logSearchCurrentPage = $scope.logSearchCurrentPage - 1;
        } else {
          $scope.logSearchPageChanged($scope.logSearchCurrentPage);
        }
      }
  
      $scope.logSearchJumpPrev = function() {
        $scope.logSearchCurrentPage = $scope.logSearchCurrentPage - $scope.logSearchPagerPageSize;
        if ($scope.logSearchCurrentPage < 1) {
          $scope.logSearchCurrentPage = 1;
        }
        $scope.logSearchPageChanged($scope.logSearchCurrentPage);
      }
  
      $scope.logSearchPagePrev = function() {
        $scope.logSearchCurrentPage = $scope.logSearchCurrentPage - 1;
        if ($scope.logSearchCurrentPage < 1) {
          $scope.logSearchCurrentPage = $scope.logSearchCurrentPage + 1;
        } else {
          $scope.logSearchPageChanged($scope.logSearchCurrentPage);
        }
      }
      /* ---------------------------------------------------------------------------------------------------------------------
      * Pagination Set End
      * ---------------------------------------------------------------------------------------------------------------------*/
  
      /***** Log Search Function **************************************************************************************************/
      function logSearchStart(m) {
        //console.log("Query Start", m);
        loading(true, "logSearchPanel");
      }
  
      function logSearchHead(helper) {
        helper.getResult(function(message) {
          //console.log("head", message, $scope.searchField);
          //$scope.logSearchFieldType = message.body.field_types;
          $scope.$apply();
        });
      }

  
      function logSearchChange(message) {
        //console.log("change", message, $scope.searchField);
        $scope.logSearchTotalCount = message.body.count;
  
        logSearchInstance.getResult(0, $scope.logSearchPageSize, function(message) {
          //console.log("change", message);
  
          var fieldTypeArray = new Array();
          var fieldOrderArray = new Array();
          var tempArray = new Array();
          $scope.logSearchFields = new Array();
  
          for (var key in message.body.field_types) {
            if (tempArray.findIndex(obj => obj.key == key) === -1) tempArray.push({"key":key,"val":message.body.field_types[key]});
            if(key!="_table") fieldTypeArray.push(key);
            if(key=="_id" || key=="_time") fieldOrderArray.push(key);
          }
          fieldTypeArray.sort();
          if(typeof message.body.field_order != "undefined") {
            for(var i=0; i<message.body.field_order.length; i++) {
              if(message.body.field_order[i]!="_id" && message.body.field_order[i]!="_time" && message.body.field_order[i]!="_table") fieldOrderArray.push(message.body.field_order[i]);
            }
          }
  
          var diffArray = array_diff(fieldTypeArray,fieldOrderArray);
          var finalArray = union(fieldOrderArray,diffArray);
  
  
          for(var i=0;i<finalArray.length; i++) {
            var fieldData = tempArray.find(obj => obj.key === finalArray[i]);
            if(typeof fieldData !== "undefined") $scope.logSearchFields.push(fieldData);
          }
  
          $scope.tdWidth = $scope.tableWidth / $scope.logSearchFields.length;
          if($scope.tdWidth < 100) $scope.tdWidth = 100;
          $scope.logSearchResult = message.body.result;
  
          $timeout(function() {
            var reHeight = $(".card-search").offset().top + 1;
            var reWidth = 0; //$(window).width() - $(".card-content").width();
            divResize("card-search",reHeight, reWidth);
          },500);
  
          $scope.$apply()
        });
  
        makeLogSearchPaginationInfo();
        $scope.$apply();
      }
  
      function logSearchTail(helper) {
        helper.getResult(function(m) {
          //console.log("tail message", m);
          logSearchInstance.getResult(0, $scope.logSearchPageSize, function(message) {
            var fieldTypeArray = new Array();
            var fieldOrderArray = new Array();
            var tempArray = new Array();
            $scope.logSearchFields = new Array();
  
            for (var key in message.body.field_types) {
              if (tempArray.findIndex(obj => obj.key == key) === -1) tempArray.push({"key":key,"val":message.body.field_types[key]});
              if(key!="_table") fieldTypeArray.push(key);
              if(key=="_id" || key=="_time") fieldOrderArray.push(key);
            }
            fieldTypeArray.sort();
            if(typeof message.body.field_order != "undefined") {
              for(var i=0; i<message.body.field_order.length; i++) {
                if(message.body.field_order[i]!="_id" && message.body.field_order[i]!="_time" && message.body.field_order[i]!="_table") fieldOrderArray.push(message.body.field_order[i]);
              }
            }
  
            var diffArray = array_diff(fieldTypeArray,fieldOrderArray);
            var finalArray = union(fieldOrderArray,diffArray);
  
  
            for(var i=0;i<finalArray.length; i++) {
              var fieldData = tempArray.find(obj => obj.key === finalArray[i]);
              if(typeof fieldData !== "undefined") $scope.logSearchFields.push(fieldData);
            }
  
            $scope.tdWidth = $scope.tableWidth / $scope.logSearchFields.length;
            if($scope.tdWidth < 100) $scope.tdWidth = 100;

            $scope.logSearchResult = message.body.result;
  
            $timeout(function() {
              var reHeight = $(".card-search").offset().top + 1;
              var reWidth = 0; //$(window).width() - $(".card-content").width();
              divResize("card-search",reHeight, reWidth);
            },500);
  
            $scope.$apply()
          });
  
          $scope.logSearchTotalCount = helper.message.body.total_count;
          if($scope.logSearchTotalCount >= $scope.userSearchLimit) {
            swal("검색제한",$scope.userSearchLimit + " 건만 조회 됩니다.","warning");
          }
  
          $scope.isNowLoading = false;
          makeLogSearchPaginationInfo();
          $scope.$apply();
        });
      }
  
      function logSearchLoaded(m) {
        //console.log("Query Loaded", m);
        endTimeStamp = new Date();
        $scope.processTime = msToTime(endTimeStamp - startTimeStamp);
        loading(false, "logSearchPanel");
        $scope.btnFlag = "ready";
        lastQueryID = m.body.id;
        orgQueryID = m.body.id;
        $scope.auditSearchCondition.lastQueryID = lastQueryID;
        $scope.auditSearchCondition.searchCount = m.body.total_count;
        makeAuditLog();
      }
  
      function logSearchFailed(raw, type, note) {
        alert(raw[0].errorCode);
        loading(false, "logSearchPanel");
        $scope.btnFlag = "ready";
      }
      /***** Log Search Function **************************************************************************************************/
  

      $scope.searchTotalLog = function(type) {
        var isSearchEnable = false;
        for(var i=0; i<$scope.searchValue.length; i++) {
          if($scope.searchValue[i]!="") {
            isSearchEnable = true;
            break;
          }
        }

        // for(var i=0; i<$scope.searchValue.length; i++) {
        //   if($scope.searchValue[i]=="" || $scope.searchValue[i]==null) {
        //     $scope.searchValue.splice(i, 1);
        //   }
        // }

        //if($scope.$parent.uRole=="member" && ($scope.searchAccount=="" && $scope.searchServiceId=="" && $scope.searchArea=="" && $scope.searchCannelId=="" && $scope.searchCategory=="" && $scope.searchUserIp=="" && $scope.searchMiddleIp=="" && $scope.searchDurationValue=="" && !isSearchEnable)) {
        if($scope.$parent.uRole=="member" && ($scope.searchAccount=="" && $scope.searchServiceId=="" && $scope.searchArea=="" && $scope.searchCannelId=="" && $scope.searchCategory=="" && $scope.searchUserIp=="" && $scope.searchMiddleIp=="" && !isSearchEnable)) {
          swal("거래로그조회", "검색 조건을 확인해 주세요.", "warning");
          return;
        }

        $scope.processTime = 0;
        $scope.logSearchType = type;

        $scope.selectedRow = null;    //마지막 선택 로우 초기화
        $scope.selectedPage = null;
        $scope.reSelectedRow = new Array();   //재검색 선택 로우도 초기화
        $scope.reSelectedPage = new Array();

        $scope.reSearchTargetField = "";    //재검색 검색 값 초기화
        $scope.reSearchTargetValue = "";

        $scope.reSearchInfo = new Array(); //재검색 초기화 하자.
        $scope.showSearchInfo = "basic";

        $scope.isErrorSearch = false; //오류 조회 초기화

        $scope.errorSelectedRow = null;
        $scope.errorSelectedPage = null;

        $scope.errorSearchFields = new Array();
        $scope.errorSearchResult = new Array();

        $scope.logSearchCurrentStart = 1;
        $scope.logSearchCurrentPage = 1;
        $scope.logSearchJumpNumber = 1;
  
        startTimeStamp = new Date();
        $scope.tableWidth = $("#mainTable").width();
  
        if(logSearchInstance!=null) {
          console.log("already log exist query")
          serviceLogdb.remove(logSearchInstance);
        }
        if(tempReSearchInstance!=null) {
          console.log("already log exist query ")
          serviceLogdb.remove(tempReSearchInstance);
        }
  
        var fianlQuery = "";
        var searchStr = "";
        $scope.auditSearchCondition = new Object();
  
        var querySB = new StringBuilder();
  
        var searchStartDate = $("#searchStartDate").val();
        var searchEndDate = $("#searchEndDate").val();

        $scope.orgSearchStartDate = searchStartDate;
        $scope.orgSearchEndDate = searchEndDate;

        $scope.auditSearchCondition.searchstartDate = searchStartDate;
        $scope.auditSearchCondition.searchEndDate = searchEndDate;

        var startMoment = moment(searchStartDate);
        var endMoment = moment(searchEndDate);

        var timeDiff = moment.duration(endMoment.diff(startMoment)).asSeconds();
        if(timeDiff < 0) {
          //Enter Key 입력시 alert 창이 바로 닫히는 문제
          $timeout(function() {
            swal("거래로그조회", "검색 일자를 확인해 주세요", "warning");
          }, 100);
          return;
        }

        var addEndMoment = endMoment.add(1,"s").format("YYYY-MM-DD HH:mm:ss");
        $scope.searchFromStr = "from=" + searchStartDate.replace(/-/g, "").replace(/ /g, "").replace(/:/g, "");
        $scope.searchToStr = "to=" + addEndMoment.replace(/-/g, "").replace(/ /g, "").replace(/:/g, "");
        
        //if($scope.tableTransaction=="" || $scope.tableTransaction==null) $scope.tableTransaction = "daishinParse"
        //if($scope.searchArea=="core") $scope.tableTransaction = "daishinCore"

        if(type=="basic") {
          $scope.auditSearchCondition.searchType = "basic";
          querySB.AppendFormat(" table {0} {1} {2}", $scope.searchFromStr, $scope.searchToStr, $scope.tableTransaction);
          //querySB.AppendFormat(" table {0} ", $scope.tableTransaction);
          //querySB.Append(" | fields - USERDATA, INFOWAY, decompressData, parseData")
          querySB.Append(" | fields - USERDATA, INFOWAY, decompressData, _filepath, _filetag, _host, _id, _table, INFOWAY_STR, line")

          if($scope.searchServiceId!="") {
            querySB.AppendFormat(" | search SERVICEID == \"*{0}*\"", $scope.searchServiceId)
            $scope.auditSearchCondition.searchServiceId = $scope.searchServiceId;
          }
          if($scope.searchAccount!="") {
            querySB.AppendFormat(" | search USERINFOGUBUN == \"*{0}*\"", $scope.searchAccount)
            $scope.auditSearchCondition.searchAccount = $scope.searchAccount;
          }
          if($scope.searchArea!="") {
            var splitArea = $scope.searchArea.split("_");
            //20201208 BP HTS WTS 통합 by chris
            if(splitArea[0]=="CNTBP") {
              querySB.AppendFormat(" | search ( jobName==\"{0}\" or jobName==\"{1}\" or jobName==\"{2}\" or jobName==\"{3}\" )", "BP", "HTS", "ETCBP", "WTS");
            }
            else {
              querySB.AppendFormat(" | search jobName == \"{0}\"", splitArea[0])
            }

            if(splitArea.length == 2) querySB.Append(" and succTY == \"ERR\"");
            else querySB.Append(" and succTY == \"SUCC\"");
            
            $scope.auditSearchCondition.searchArea = $scope.searchArea;
          }
          if($scope.searchCannelId!="") {
            querySB.AppendFormat(" | search CHANNELID == \"*{0}*\"", $scope.searchCannelId)
            $scope.auditSearchCondition.searchCannelId = $scope.searchCannelId;
          }
          if($scope.searchCategory!="") {
            if($scope.searchCategory=="RR") {
              querySB.AppendFormat(" | search procTY == \"{0}\"", "*R")
            }
            else {
              querySB.AppendFormat(" | search procTY == \"{0}\"", $scope.searchCategory)
            }
            
            $scope.auditSearchCondition.searchCategory = $scope.searchCategory;
          }
          if($scope.searchUserIp!="") {
            querySB.AppendFormat(" | search IP == \"*{0}*\"", $scope.searchUserIp)
            $scope.auditSearchCondition.searchUserIp = $scope.searchUserIp;
          }
          if($scope.searchMiddleIp!="") {
            querySB.AppendFormat(" | search MMID == \"*{0}*\"", $scope.searchMiddleIp)
            $scope.auditSearchCondition.searchMiddleIp = $scope.searchMiddleIp;
          }
          if ($scope.searchField.length > 0 && ($scope.searchField.length == $scope.searchValue.length)) {
            searchStr = " | search ";
            for (var i = 0; i < $scope.searchField.length; i++) {
              if(!($scope.searchField[i]=="" || $scope.searchValue[i]=="" || typeof $scope.searchField[i]==="undefined" || typeof $scope.searchValue[i]==="undefined")) {
                searchStr += $scope.searchField[i] + " == \"*" + $scope.searchValue[i] + "*\"";
                if (i < ($scope.searchField.length - 1)) searchStr += " and ";

                $scope.auditSearchCondition[$scope.searchField[i]] = $scope.searchValue[i];
              }
            }
          }
          querySB.AppendFormat("{0}", searchStr);

          if($scope.searchDurationValue!="") {
            var searchDurationType = "==";
            var searchDurationStr = "같음";
            if($scope.searchDurationType=="qt") {
              searchDurationType = ">";
              searchDurationStr = "초과"
            }
            else if($scope.searchDurationType=="lt") {
              searchDurationType = "<";
              searchDurationStr = "미만"
            }

            querySB.AppendFormat(" | search duration {0} {1}", searchDurationType, $scope.searchDurationValue)
            $scope.auditSearchCondition.searchDurationType = searchDurationStr;
            $scope.auditSearchCondition.searchDurationValue = $scope.searchDurationValue;
          }
        }
        else {
          $scope.auditSearchCondition.searchType = "fulltext";
          var searchStrSB = new StringBuilder();
          var addSearchStrSB = new StringBuilder();
          addSearchStrSB.Append(" | search");
          var fulltextOption = "t";

          if($scope.searchServiceId!="") {
            searchStrSB.AppendFormat(" and SERVICEID == \"{0}\"", $scope.searchServiceId)
            $scope.auditSearchCondition.searchServiceId = $scope.searchServiceId;
          }
          if($scope.searchAccount!="") {
            searchStrSB.AppendFormat(" and USERINFOGUBUN == \"{0}\"", $scope.searchAccount)
            $scope.auditSearchCondition.searchAccount = $scope.searchAccount;
          }
          if($scope.searchArea!="") {
            var splitArea = $scope.searchArea.split("_");
            if(splitArea[0]=="CNTBP") {
              searchStrSB.AppendFormat(" and ( jobName == \"{0}\" or jobName == \"{1}\" or jobName == \"{2}\" or jobName == \"{3}\" )", "BP", "HTS", "ETCBP", "WTS");
            }
            else {
              searchStrSB.AppendFormat(" and jobName == \"{0}\"", splitArea[0])
            }

            if(splitArea.length == 2) addSearchStrSB.Append(" succTY == \"ERR\" and");
            else addSearchStrSB.Append(" succTY == \"SUCC\" and");

            $scope.auditSearchCondition.searchArea = $scope.searchArea;
          }
          if($scope.searchCannelId!="") {
            searchStrSB.AppendFormat(" and CHANNELID == \"{0}\"", $scope.searchCannelId)
            $scope.auditSearchCondition.searchCannelId = $scope.searchCannelId;
          }
          if($scope.searchCategory!="") {
            if($scope.searchCategory=="RR") {
              searchStrSB.AppendFormat(" and procTY == \"{0}\"", "*R");
            }
            else {
              searchStrSB.AppendFormat(" and procTY == \"{0}\"", $scope.searchCategory)
            }
            $scope.auditSearchCondition.searchCategory = $scope.searchCategory;
          }
          if($scope.searchUserIp!="") {
            searchStrSB.AppendFormat(" and IP == \"{0}\"", $scope.searchUserIp)
            $scope.auditSearchCondition.searchUserIp = $scope.searchUserIp;
          }
          if($scope.searchMiddleIp!="") {
            searchStrSB.AppendFormat(" and MMID == \"{0}\"", $scope.searchMiddleIp)
            $scope.auditSearchCondition.searchMiddleIp = $scope.searchMiddleIp;
          }

          var subSearch = "";
          if ($scope.searchField.length > 0 && ($scope.searchField.length == $scope.searchValue.length)) {
            subSearch = " and ";
            for (var i = 0; i < $scope.searchField.length; i++) {
              if(!($scope.searchField[i]=="" || $scope.searchValue[i]=="" || typeof $scope.searchField[i]==="undefined" || typeof $scope.searchValue[i]==="undefined")) {
                subSearch += $scope.searchField[i] + " == \"" + $scope.searchValue[i] + "\"";
                if (i < ($scope.searchField.length - 1)) subSearch += " and ";

                $scope.auditSearchCondition[$scope.searchField[i]] = $scope.searchValue[i];
              }
            }
          }
          if(subSearch!= " and ") searchStrSB.AppendFormat("{0}", subSearch);

          if($scope.searchDurationValue!="") {
            var searchDurationType = "==";
            var searchDurationStr = "같음";
            if($scope.searchDurationType=="qt") {
              searchDurationType = ">";
              searchDurationStr = "초과"
            }
            else if($scope.searchDurationType=="lt") {
              searchDurationType = "<";
              searchDurationStr = "미만"
            }
            searchStrSB.AppendFormat(" and duration {0} {1}", searchDurationType, $scope.searchDurationValue)
            $scope.auditSearchCondition.searchDurationType = searchDurationStr;
            $scope.auditSearchCondition.searchDurationValue = $scope.searchDurationValue;
          }

          if(searchStrSB.ToString() == "" || searchStrSB.ToString()==" and ") {
            searchStr = "\"*\"";
            fulltextOption = "f";
          }
          else searchStr = searchStrSB.ToString().substr(4);

          var addSearchStr = "";
          if(addSearchStrSB.ToString().length > 9) {
            addSearchStr = addSearchStrSB.ToString().substr(0, addSearchStrSB.ToString().length - 4);
          }

          //querySB.AppendFormat(" fulltext {0} {1} _tt=t {2} {3}", $scope.searchFromStr, $scope.searchToStr, searchStr, addSearchStr);
          querySB.AppendFormat(" fulltext {0} {1} _tt={5} {2} from {3} {4}", $scope.searchFromStr, $scope.searchToStr, searchStr, $scope.tableTransaction, addSearchStr,fulltextOption);
          //querySB.Append(" | fields - USERDATA, INFOWAY, decompressData, parseData")
          querySB.Append(" | fields - USERDATA, INFOWAY, decompressData, _filepath, _filetag, _host, _id, _table, INFOWAY_STR, line")
        }

        if($scope.userSearchLimit > 0) {
          querySB.AppendFormat(" | limit {0}", $scope.userSearchLimit);
          $scope.auditSearchCondition.userSearchLimit = $scope.userSearchLimit;
        }


        //LOGKEY 중복제거
        // querySB.Append(" | eval LOG_KEY = if(isnull(LOG_KEY), concat(LOGTIME, hostName, USERINFOGUBUN), LOG_KEY)")
        // querySB.Append(" | eval LOG_KEY = if(isnull(LOG_KEY), concat(LOGTIME, hostName, USERINFOGUBUN, UTIME, trTY), LOG_KEY)")
        // 20210121 LOG_KEY 변경(chris)
        querySB.Append(" | eval LOG_KEY = concat(LOGTIME, hostName, USERINFOGUBUN, UTIME, trTY)")
        querySB.Append(" | sort limit=1 -_time by LOG_KEY");

        querySB.Append(" | eval serviceID = trim(SERVICEID)")
        querySB.AppendFormat(" | lookup {0} serviceID output serviceName", $scope.lookupIRS)
        querySB.Append(" | sort SORT_TIME asc")
        ///20200828 add query for Download
        querySB.Append(" | eval UTIME_STR=concat(string(epoch(long(left(UTIME, 13))), \"yyyyMMddHHmmssSSS\"), right(UTIME,3))");
        querySB.Append(" | eval CTIME=concat(string(epoch(long(left(UTIME, 13))), \"yyyy-MM-dd HH:mm:ss SSS\"), right(UTIME,3))");
        querySB.Append(" | eval SORT_TIME=replace(SORT_TIME, \".\", \" \")");
        // querySB.Append(" | eval GUID=concat(CHANNELID,\" \",CMID,\" \", UTIME_STR,\" \", RQID,\" \", RQHND, \" \",MMID)");
        querySB.Append(" | eval 화면번호=concat(SCREENID,\"-\",UICOMID)");

        //20201209 jobName 통합 BP HTS WTS ETCBP => 접속BP  by chris
        querySB.AppendFormat(" | eval jobName = case( (jobName==\"{0}\" or jobName==\"{1}\" or jobName==\"{2}\" or jobName==\"{3}\"), \"접속BP\", jobName==\"{4}\", \"CORE\", jobName)", "BP", "HTS", "ETCBP", "WTS", "COR");

        //20201221 hostName 누락 처리 job_node 로 lookup 한다.
        querySB.Append(" | lookup NODE_HOST job_node output hostName");

        querySB.Append(" | rename trTY as 처리유형, jobName as 업무영역, hostName as 호스트이름, CTIME as Client_Time, SORT_TIME as 로그발생시각, serviceID as 서비스식별자, serviceName as 서비스식별자(한글), GUID as 고유식별번호, USERDEPT as 접속자부서, USEROPEREMPID as 조작자사번, IP as 사용자IP, MAC as 맥주소, USERINFOGUBUN as 계좌번호, MESSAGECODE as 메시지코드, MESSAGEBODY as 메시지영역, MMID as 경유서버IP, duration as 시간간격");

        for(var i=0; i<parseCount; i++) {
          querySB.AppendFormat(", parseData{0} as 사용자데이터{1}", i+1, addZeroStr(i+1));
        }
        querySB.Append(" | order 처리유형, 업무영역, 호스트이름, Client_Time,  로그발생시각, 서비스식별자, 서비스식별자(한글),  화면번호, 고유식별번호,  접속자부서,  사용자IP, 맥주소, 계좌번호,  메시지코드, 메시지영역,  경유서버IP");
        for(var i=0; i<parseCount; i++) {
          querySB.AppendFormat(", 사용자데이터{0}", addZeroStr(i+1));
        }

        fianlQuery = querySB.ToString();
  
        if($scope.$parent.uid=="root" || $scope.$parent.uid=="dsadmin" || $scope.$parent.uid=="dsuser") {
          console.log("Run Query : " + fianlQuery);
        }
  
        $scope.logSearchFields = [];
        $scope.logSearchResult = [];
        $scope.btnFlag = "searching";
  
        logSearchInstance = serviceLogdb.create(pid);
        $scope.logSearchPageSize = $scope.searchPage;
        logSearchQuery = logSearchInstance.query(fianlQuery, $scope.searchPage);
  
        try {
          logSearchQuery
            .started(logSearchStart)
            .onHead(logSearchHead)
            .onStatusChange(logSearchChange)
            .onTail(logSearchTail)
            .loaded(logSearchLoaded)
            .failed(logSearchFailed);
  
          serviceLogdb.remove(logSearchInstance);
        } catch (e) {
          console.log(e);
        }
      }

      function addZeroStr(num) {
        return ('0' + num).substr(-2);
      }








  
      $scope.searchStop = function() {
        logSearchInstance.stop();
  
        loading(false, "logSearchPanel");
        $scope.btnFlag = "ready";
      }

      $scope.searchConditionInit = function() {
        $scope.searchStartDate = getNowDateTimeStart(1);
        $scope.searchEndDate = getNowDateTimeEnd(1);
    
        $scope.logSearchForm = new Array();
        $scope.logSearchForm.push(0);
        $scope.searchField = new Array();
        $scope.searchCondition = new Array();
        $scope.searchValue = new Array();

        $scope.searchAccount = "";
        $scope.searchServiceId = "";
        $scope.searchArea = "";
        $scope.searchCannelId = "";
        $scope.searchCategory = "";
        $scope.searchUserIp = "";
        $scope.searchMiddleIp = "";

        $scope.processTime = 0;

        $scope.reSearchInfo = new Array(); //재검색 초기화 하자.
        $scope.showSearchInfo = "basic";

        $scope.logSearchCurrentStart = 1;
        $scope.logSearchCurrentPage = 1;
        $scope.logSearchJumpNumber = 1;

        if(logSearchInstance!=null) {
          console.log("already log exist query")
          serviceLogdb.remove(logSearchInstance);
        }
        if(tempReSearchInstance!=null) {
          console.log("already log exist query ")
          serviceLogdb.remove(tempReSearchInstance);
        }

        $scope.logSearchResult = new Array();
        $scope.logSearchFields = new Array();
        $scope.logSearchPaginationArray = [];

        $scope.logSearchTotalCount = 0;
        $scope.logSearchPagerPageSize = 10;
        $scope.logSearchCurrentStart = 1;
        $scope.logSearchCurrentPage = 1;
        $scope.logSearchJumpNumber = 1;

        $scope.showSearchInfo = "basic";

        $scope.reSearchInfo = new Array();
        $scope.reSearchMax = 3;

        $scope.reSearchTargetField = "";
        $scope.reSearchTargetValue = "";

        $scope.reSearchResult = new Array();
        $scope.reSearchFields = new Array();

        reSearchInstance = new Array();
        reSearchQuery = new Array();
      }
  
      

      // 20201208 BP, HTS, WTS 를 접속BP 로 통합 by chris
      $scope.searchAreaArray = [
        {key:'CNTBP', value:'접속BP'},
        {key:'CNTBP_ERR', value:'접속BP(오류)'},
        // {key:'BP', value:'BP'},
        // {key:'BP_ERR', value:'BP(오류)'},
        {key:'FIX', value:'F/X'},
        {key:'FIX_ERR', value:'F/X(오류)'},
        {key:'GFIX', value:'Global FIX'},
        {key:'GFIX_ERR', value:'Global FIX(오류)'},
        // {key:'HTS', value:'HTS/MTS'},
        // {key:'HTS_ERR', value:'HTS/MTS(오류)'},
        {key:'MCG', value:'MCG'},
        {key:'SYS', value:'SYSLOG'},
        // {key:'WTS', value:'WTS'},
        // {key:'WTS_ERR', value:'WTS(오류)'},
        // {key:'ETCBP', value:'기타BP'},
        // {key:'ETCBP_ERR', value:'기타BP(오류)'},
        {key:'EXS', value:'대외서비스'},
        {key:'ECG', value:'외부채널연계'},
        {key:'ECG_ERR', value:'외부채널연계(오류)'},
        {key:'AUTO', value:'자동매매'},
        {key:'AUTO_ERR', value:'자동매매(오류)'},
        {key:'ORD', value:'주문'},
        {key:'ORD_ERR', value:'주문(오류)'},
        {key:'COR', value:'코어'},
        {key:'PROG', value:'프로그램매매'},
        {key:'PROG_ERR', value:'프로그램매매(오류)'},
      ]

      $scope.searchCannelIdArray = [
        {key:'00', value:'00.영업점'},
        {key:'01', value:'01.고객지원센터'},
        {key:'02', value:'02.CT영업점자동'},
        {key:'03', value:'03.프로그램매매'},
        {key:'04', value:'04.FIX매매'},
        {key:'05', value:'05.CT영업점수동'},
        {key:'06', value:'06.DMA매매'},
        {key:'07', value:'07.연계신용업무시스템'},
        {key:'08', value:'08.Bypass-FIX'},
        {key:'09', value:'09.ELW-LP'},
        {key:'0A', value:'0A.ODS-안드로이드'},
        {key:'0B', value:'0B.ODS-아이패드'},
        {key:'0C', value:'0C.장내파생 LP'},
        {key:'0D', value:'0D.증권금융매도대행'},
        {key:'0E', value:'0E.은행신탁FIX주문'},
        {key:'10', value:'10.ELW-VIP'},
        {key:'11', value:'11.WIN'},
        {key:'12', value:'12.KS트레이드'},
        {key:'13', value:'13.AMJIP'},
        {key:'21', value:'21.하이텔DOS'},
        {key:'22', value:'22.하이텔WIN'},
        {key:'23', value:'23.천리안DOS'},
        {key:'30', value:'30.인터넷카페'},
        {key:'31', value:'31.U-CYBOS(HTS)'},

        {key:'32', value:'32.데이콤'},
        {key:'33', value:'33.INET'},
        {key:'34', value:'34.VIP'},
        {key:'35', value:'35.하나로통신'},
        {key:'36', value:'36.두루넷'},
        {key:'37', value:'37.C-CAMS'},
        {key:'38', value:'38.인터넷영문'},
        {key:'41', value:'41.한국통신'},
        {key:'42', value:'42.데이콤'},
        {key:'43', value:'43.나우누리'},
        {key:'44', value:'44.하이텔PPP'},
        {key:'51', value:'51.대신웹-WTS'},
        {key:'52', value:'52.퇴직연금웹-WTS'},
        {key:'61', value:'61.객장주문'},
        {key:'62', value:'62.영업소'},
        {key:'63', value:'63.전용창구'},
        {key:'64', value:'64.사이버지점'},
        {key:'65', value:'65.트레이딩룸'},
        {key:'71', value:'71.팜피스'},
        {key:'72', value:'72.STK(M-CYBOS)'},
        {key:'73', value:'73.M-STOCK'},
        {key:'74', value:'74.스마트폰'},
        {key:'75', value:'75.KT(M-CYBOS)'},
        {key:'76', value:'76.LGT(M-CYBOS)'},
        {key:'77', value:'77.윈도우모바일(MP)'},
        {key:'78', value:'78.아이폰'},
        {key:'79', value:'79.안드로이드'},
        {key:'80', value:'80.아이폰(MP)'},
        {key:'81', value:'81.대신ARS'},
        {key:'82', value:'82.공동ARS'},
        {key:'83', value:'83.아이패드(CT)'},
        {key:'84', value:'84.안드로이드(CT)'},
        {key:'85', value:'85.갤럭시탭(CT)'},
        {key:'86', value:'86.모바일자동'},
        {key:'87', value:'87.증권왕(안드로이드)'},
        {key:'91', value:'91.휴대폰'},
        {key:'92', value:'92.SKT1MM'},
        {key:'93', value:'93.KTF팝업증권'},
        {key:'94', value:'94.증권통(아이폰)'},
        {key:'95', value:'95.증권통(안드로이드)'},
        {key:'96', value:'96.티스톡(아이폰)'},
        {key:'97', value:'97.티스톡(안드로이드)'},
        {key:'98', value:'98.유팍스(아이폰)'},
        {key:'99', value:'99.유팍스(안드로이드)'},
        {key:'A1', value:'A1.스톡아이'},
        {key:'A2', value:'A2.네이트원클릭'},
        {key:'A3', value:'A3.원클릭프로'},
        {key:'A4', value:'A4.웹스크린'},
        {key:'A5', value:'A5.IP-TV'},
        {key:'A6', value:'A6.플러스'},
        {key:'A7', value:'A7.영업점플러스'},
        {key:'A8', value:'A8.CT자동'},
        {key:'A9', value:'A9.CT수동'},
        {key:'B1', value:'B1.천사전략'},
        {key:'B2', value:'B2.이스톰'},
        {key:'B3', value:'B3.에스케이'},
        {key:'C1', value:'C1.CATS자동'},
        {key:'C2', value:'C2.VTS서버용'},
        {key:'C3', value:'C3.TS연동용'},
        {key:'C4', value:'C4.CP연동주문'},
        {key:'C5', value:'C5.CATS반자동'},
        {key:'C6', value:'C6.매직오더'},
        {key:'C7', value:'C7.모바일CATS'},
        {key:'D1', value:'D1.CREON-HTS'},
        {key:'D2', value:'D2.CREON-WTS'},
        {key:'D3', value:'D3.CREON-MINI'},
        {key:'D4', value:'D4.아이폰(CREON)'},
        {key:'D5', value:'D5.아이패드(CREON)'},
        {key:'D6', value:'D6.안드로이드(CREON)'},
        {key:'D7', value:'D7.갤럭시탭(CREON)'},
        {key:'D8', value:'D8.CREON-증권통(아이폰)'},
        {key:'D9', value:'D9.CREON-증권통(안드로이드)'},
        {key:'DA', value:'DA.D-VIP'},
        {key:'DB', value:'DB.모바일자동주문(C)'},
        {key:'DC', value:'DC.CREON-모바일(아이폰)'},
        {key:'DD', value:'DD.CREON-모바일(안드로이드)'},
        {key:'DE', value:'DE.CREON-티스톡(아이폰)'},
        {key:'DF', value:'DF.CREON-티스톡(안드로이드)'},
        {key:'DG', value:'DG.CREON-유팍스(아이폰)'},
        {key:'DH', value:'DH.CREON-유팍스(안드로이드)'},
        {key:'DI', value:'DI.CREON-증권왕(안드로이드)'},
        {key:'DJ', value:'DJ.CREON-증권플러스(안드로이드)'},
        {key:'DK', value:'DK.CREON-증권플러스(아이폰)'},
        {key:'DL', value:'DL.크레온플러스'},
        {key:'I1', value:'I1.디셈버앤컴퍼니자산운용'},
        {key:'I3', value:'I3.두나무투자일임'},
        {key:'I4', value:'I4.이루다투자일임'},
        {key:'P1', value:'P1.아이폰-퇴직연금'},
        {key:'P2', value:'P2.안드로이드-퇴직연금'},
        {key:'R1', value:'R1.로보-사이보스아이폰'},
        {key:'R2', value:'R2.로보-사이보스안드'},
        {key:'R3', value:'R3.로보-크레온아이폰'},
        {key:'R4', value:'R4.로보-크레온안드'},
        {key:'X1', value:'X1.건강보험'},
        {key:'X2', value:'X2.챗봇'},
        {key:'X3', value:'X3.오토콜링'},
        {key:'Z1', value:'Z1.주문시스템'},
        {key:'Z2', value:'Z2.NEFSS(F/W)'},
        {key:'Z3', value:'Z3.EAI'},
        {key:'Z4', value:'Z4.메신저'},
        {key:'Z5', value:'Z5.FEP(대외서비스)'},
        {key:'Z6', value:'Z6.MCG(대외서비스)'},
        {key:'Z7', value:'Z7.네이버증권서비스'},
        {key:'ZA', value:'ZA.배치'},
      ]

      $scope.searchCategoryArray = [
        {key:'RR', value:'RQ/RP'},
        {key:'UP', value:'PB/UNSOL'},
      ]
  
      $scope.logSearchForm.push(0);
      $scope.logSearchAdd = function() {
        var inputValue = $scope.logSearchForm.length + 1;
        $scope.searchCondition.push("and");
        if (inputValue > 5) swal("거래내역 조회", "조건을 더이상 추가 할 수 없습니다.", "error");
        else $scope.logSearchForm.push(inputValue);
  
        $timeout(function() {
          var reHeight = $(".card-search").offset().top + 1;
          var reWidth = 0; //$(window).width() - $(".card-content").width();
          divResize("card-search",reHeight, reWidth);
        },500)
  
      }
      $scope.logSearchDel = function(idx) {
        if ($scope.logSearchForm.length > 1) {
          $scope.logSearchForm.splice(idx, 1);
          $scope.searchField.splice(idx, 1);
          $scope.searchCondition.splice(idx, 1);
          $scope.searchValue.splice(idx, 1);
        } else if ($scope.logSearchForm.length == 1) {
          $scope.searchField = new Array();
          $scope.searchCondition = new Array();
          $scope.searchValue = new Array();
        } else {
          console.log("What");
        }
  
        $timeout(function() {
          var reHeight = $(".card-search").offset().top + 1;
          var reWidth = $(window).width() - $(".card-content").width();
          divResize("card-search",reHeight, reWidth);
        },500)
      }
  

      function getHeaderInfo(item) {
        //console.log(item)
        // 서비스/TR 영역
        $scope.totalLength = item.TOTALLENGTH;
        $scope.headerLength = item.HEADERLENGTH;
        $scope.messageLength = item.MESSAGELENGTH;
        $scope.userdataLength = item.USERDATALENGTH;
        
        //$scope.tr = item.TR;
        //$scope.serviceId = item.SERVICEID;
        //$scope.serviceName = item.serviceName;

        $scope.trTY = item['처리유형'];
        $scope.jobName = item['업무영역'];
        $scope.hostName = item['호스트이름'];
        $scope.CTIME = item['Client_Time'];
        $scope.SORT_TIME = item['로그발생시각'];
        $scope.serviceID = item['서비스식별자'];
        $scope.serviceName = item['서비스식별자(한글)'];
        if($scope.serviceName==null || $scope.serviceName=="") $scope.serviceName = $scope.serviceID;
        $scope.GUID = item['고유식별번호'];
        $scope.screenNum = item['화면번호'];
        
        $scope.messageVersion = item.MESSAGEVERSION;

        // 시스템 정보영역
        $scope.channelId = item.CHANNELID;
        $scope.cmId= item.CMID;
        $scope.uTime = item._time;
        $scope.rqId= item.RQID;
        $scope.rqHnd= item.RQHND;
        //$scope.mmId= item.MMID;
        $scope.mmId= item['경유서버IP'];
        //$scope.ip= item.IP;
        $scope.ip= item['사용자IP'];
        $scope.pmId= item.PMID;
        //$scope.mac= item.MAC;
        $scope.mac= item['맥주소'];
        $scope.reserved= item.RESERVED;

        // 사용자 정보영역
        $scope.user_level= item.USERLEVEL;
        $scope.user_company_code= item.USERCOMPANYCODE;
        $scope.user_branch_code= item.USERBRANCHCODE;
        $scope.user_biz_code= item.USERBIZCODE;
        //$scope.user_dept= item.USERDEPT;
        $scope.user_dept= item['접속자부서'];
        $scope.user_oper_company= item.USERORDERCOMPANY;
        //$scope.user_oper_empid= item.USEROPEREMPID;
        $scope.user_oper_empid= item['조작자사번'];
        $scope.ssoauth= item.SSOAUTH;
        //$scope.user_info_gubun= item.USERINFOGUBUN;
        $scope.user_info_gubun= item['계좌번호'];
        $scope.locale= item.LOCALE;
        $scope.screenID= item.SCREENID;
        $scope.uicomID= item.UICOMID;

        // 메시지영역
        // $scope.message_code= item.MESSAGECODE;
        // $scope.message_body= item.MESSAGEBODY;
        $scope.message_code= item['메시지코드'];
        $scope.message_body= item['메시지영역'];

        //사용자 상태영역
        $scope.userFlag3= item.USERFLAG3;
        $scope.timeCnt = item.TRACETIMECNT;
        if(typeof item.TRACETIMEDATA === "undefined") $scope.timeData = [];
        else $scope.timeData = item.TRACETIMEDATA;

        $scope.e2eCnt = item.E2ECNT;
        if(typeof item.E2EDATA === "undefined") $scope.e2eData = [];
        else $scope.e2eData = item.E2EDATA;

        //처리 유형
        // if(item.procTY!="UP") {
        //   $scope.showSubMenu = true;
        //   $scope.showSubType = (item['처리유형'] == "RQ") ? "RP" : "RQ";
        //   $scope.showSubKey = item['고유식별번호'];
        // }
        // $scope.procTY = item.procTY;
      }

      $scope.checkObj = function(item) {
        if(typeof item === "object") {
          if(Array.isArray(item)) return 'arr';
          else return 'obj';
        }
        else return 'str';
      }


      function makeAuditSearchCondition(obj) {
        var audutStr = new StringBuilder();
        if(obj.searchType=="basic") audutStr.Append("[기본검색]");
        else if(obj.searchType=="fulltext") audutStr.Append("[인덱스검색]");
        else if(obj.searchType=="research") audutStr.Append("[재검색]");
        else if(obj.searchType=="download") audutStr.Append("[다운로드]");
        else if(obj.searchType=="detail") audutStr.Append("[상세보기]");
        else if(obj.searchType=="detaildownload") audutStr.Append("[상세다운로드]");
        else audutStr.AppendFormat("[{0}]", obj.searchType);

        for(key in obj) {
          var keyName = defineAuditField[key];
          if(typeof keyName === "undefined") keyName = key;
          // console.log("keyName", keyName)
          if(key!="searchType" && key!="lastQueryID") audutStr.AppendFormat(" {0} : {1}", keyName, obj[key]);
        }

        return audutStr.ToString();
      }


      function makeAuditLog() {
        //json "{ 	user: 'root', remote_ip: '1.1.1.1', msg: 'msg', source: 'transaction' }" | import daishinAudit	

        // console.log($scope.auditSearchCondition)
        // console.log($scope.$parent.uRemoteIP)
        // console.log($scope.$parent.uid)

        if(auditImportInstance!=null) {
          console.log("already import exist query")
          serviceLogdb.remove(auditImportInstance);
        }

        var auditQuerySB = new StringBuilder();
        //auditQuerySB.AppendFormat("json \"{ user: '{0}', remote_ip:'{1}', source: 'transaction', msg: '{2}', query_id: '{3}', time: '{4}' }\"", $scope.$parent.uid, $scope.$parent.uRemoteIP, makeAuditSearchCondition($scope.auditSearchCondition), $scope.auditSearchCondition.lastQueryID, getNowDateTime());
        auditQuerySB.AppendFormat("proc procAuditLogImport(\"{ user: '{0}', remote_ip:'{1}', source: 'transaction', msg: '{2}', query_id: '{3}', time: '{4}' }\")", $scope.$parent.uid, $scope.$parent.uRemoteIP, makeAuditSearchCondition($scope.auditSearchCondition), $scope.auditSearchCondition.lastQueryID, getNowDateTime());
        //auditQuerySB.Append(" | import daishinAudit");
        //auditQuerySB.AppendFormat(" | outputjson append=t log/{0}", "answer_audit_" + getNowDateFormat());
        
        auditImportInstance = serviceLogdb.create(pid);
        auditImportQuery = auditImportInstance.query(auditQuerySB.ToString(), 10);
  
        try {
          auditImportQuery
            .started(function() {})
            .onHead(function(){})
            .onStatusChange(function() {})
            .onTail(function() {})
            .loaded(function() {
              //console.log("import loaded")
              serviceLogdb.remove(auditImportInstance);
            })
            .failed(function() {});
        } catch (e) {
          console.log(e);
        }
      }


      function infoInit() {
        $scope.totalLength = 0;
        $scope.headerLength = 0;
        $scope.messageLength = 0;

        $scope.showTitleKo = true;
        $scope.showInfo = "header";
      }

      function getParseData(callback) {
        var parseStartTime = new Date();
        
        loading(true, "adminTransaction");
        //console.log("#############", $scope.parseDataList);
        var respObj = $scope.parseDataList;
        respObj.parseCount = parseCount;
        respObj.parseJob = $scope.parseDataJob;

        // console.log("respObj", respObj)
        
        socket.send('com.answer.datalog.dsui.main.DatalogMainMsgBus.getUserDataParse', respObj, pid)
        .success(function(m) {
          // console.log("success Parse Data", m);
          $scope.userDataFieldEn = m.body.fieldListEn;
          $scope.userDataFieldKo = m.body.fieldListKo;
          $scope.userDataValue = new Array();

          var retList = m.body.retunList;
          for(var i=0; i<retList.length; i++) {
            if(retList[i].length < m.body.fieldListEn.length) {
              retList[i] = answerArrayFill(retList[i],"", m.body.fieldListEn.length);
            }
            $scope.userDataValue.push(retList[i]);
          }
          //console.log($scope.userDataValue)
          callback();
          loading(false, "adminTransaction");

          var parseEndTime = new Date();
          console.log("Parse Duration : ", parseEndTime - parseStartTime);

          $scope.$apply();
        })
        .failed(function(m, raw) {
          console.log("fail m", m);
          console.log("raw", raw);
          loading(false, "adminTransaction");

          swal("사용자 데이터 관리", "파싱데이터를 불러 올 수 없습니다.", "error");
        });
      }



      $scope.closeTransaction = function() {
        //console.log("Close Modal")
        loading(false, "adminTransaction");
      }

      $scope.adminTransaction = function(item, idx, page, type) {
        //console.log("modal start", idx, page, type)
        //console.log(typeof item.LOGTIME);

        // console.log(item, idx, page, type)

        if(type=='basic') {
          $scope.selectedRow = idx;
          $scope.selectedPage = page;
        }
        else if(type=='error') {
          $scope.errorSelectedRow = idx;
          $scope.errorSelectedPage = page;
        }
        else {
          $scope.reSelectedRow[type] = idx;
          $scope.reSelectedPage[type] = page;
        }

        $("#adminTransaction").modal("show").draggable({handle: '.answer-modal-header'});

        $scope.auditSearchCondition = new Object();
        $scope.auditSearchCondition.searchType = "detail";
        // $scope.auditSearchCondition.guid = item['고유식별번호'].trim();
        $scope.auditSearchCondition.searchServiceId = item['서비스식별자'].trim();
        $scope.auditSearchCondition.searchAccount = item['계좌번호'].trim();
        $scope.auditSearchCondition.ctime = item['Client_Time']
        $scope.auditSearchCondition.lastQueryID = 0;
        makeAuditLog();

        infoInit();
        getHeaderInfo(item);

        $scope.modalStart = true;
        
        $scope.userDataFieldEn = new Array();
        $scope.userDataFieldKo = new Array();
        $scope.userDataValue = new Object();

        $scope.showSubValue = new Object();
        $scope.parseDataJob = "";
        
        //if(item['사용자데이터1'] == null || item['사용자데이터1'] == "") {
        if(item['사용자데이터01'] == null) {
          console.log("parse data 1 is null")
          $scope.parseResult = "IRSCHECK";
          $scope.parseInfo = item.parseInfo;
        }
        else {
          $scope.parseResult = "SUCCESS";
          $scope.parseDataList = new Object();
          $scope.parseDataJob = item['업무영역'];

          for(var i=0; i<parseCount; i++) {
            var keyNum = i + 1;
            $scope.parseDataList["parseData" + keyNum] = item['사용자데이터' + addZeroStr(keyNum)];
          }
        }
      }





























      




















      

      $scope.showEventInfo = function(type) {
        //console.log("detail modal type", type);
        if(type=="header") $scope.showInfo = "header";
        else if(type=="user") {
          $scope.showInfo = "user";
          if($scope.modalStart) {
            //console.log("Get Parse Data");
            if($scope.parseResult=="SUCCESS") getParseData(function() {});
            $scope.modalStart = false;
          }
        }
      }


      $scope.findServiceIDDialog = function() {
        $scope.findServiceID = "";
        $scope.findServiceName = "";
        $scope.findServiceList = [];

        $("#findServiceID").modal({backdrop:"static"}).draggable({handle: '.answer-modal-header'});
      }

      $scope.findServiceIDAction = function(type) {
        // console.log("type", type)
        if(irsSearchInstance!=null) {
          console.log("already irs exist query")
          serviceLogdb.remove(irsSearchInstance);
        }

        if(type == 'id' && $scope.findServiceID=="") {
          swal("서비스ID 찾기", "서비스ID를 입력해 주세요.", "error");
          return;
        }

        if(type == 'name' && $scope.findServiceName=="") {
          swal("서비스ID 찾기", "서비스명을 입력해 주세요.", "error");
          return;
        }

        var queryIRS = new StringBuilder();
        var fianlIRS = "";
        queryIRS.AppendFormat("memlookup op=list name={0}", $scope.lookupIRS);
        if(type == 'id') {
          $scope.findServiceName = "";
          queryIRS.AppendFormat(" | search serviceID==\"*{0}*\"", $scope.findServiceID)
        }
        else {
          $scope.findServiceID = "";
          queryIRS.AppendFormat(" | search serviceName==\"*{0}*\"", $scope.findServiceName)
        }
        fianlIRS = queryIRS.ToString();

        $scope.findServiceList = [];
        irsSearchInstance = serviceLogdb.create(pid);
        irsSearchQuery = irsSearchInstance.query(fianlIRS, 20000);
  
        try {
          irsSearchQuery
            .started(function(m) {
              loading(true, "irsSearchPanel");
              //console.log("irs start", m);
            })
            .onHead(function(helper) {
              helper.getResult(function(m) {
                //console.log("irs head", m);
              })
            })
            .onStatusChange(function(m) {
              //console.log("irs change", m);
              $scope.findServiceList = m.body.result;
              $scope.$apply()
            })
            .onTail(function(helper) {
              helper.getResult(function(m) {
                //console.log("irs tail", m);
                $scope.findServiceList = m.body.result;
                $scope.$apply();
              })
            })
            .loaded(function(m) {
              //console.log("irs load", m);
              loading(false, "irsSearchPanel");
            })
            .failed(function(raw, type, note) {
              alert(raw[0].errorCode);
              loading(false, "irsSearchPanel");
            });
  
          serviceLogdb.remove(irsSearchInstance);
        } catch (e) {
          console.log(e);
        }
      }

      $scope.selectedIRS = function(serviceID) {
        $scope.searchServiceId = serviceID;
        $("#findServiceID").modal('hide');
      }
      $scope.unSelectedIRS = function() {
        $scope.searchServiceId = "";
      }



      $scope.selectedFieldControl = function() {
        $scope.showSelectFieldHeight = !$scope.showSelectFieldHeight
        $timeout(function() {
          if($scope.showSearchInfo=="basic") {
            var reHeight = $(".card-search").offset().top + 1;
            var reWidth = 0; //$(window).width() - $(".card-content").width();
            divResize("card-search",reHeight, reWidth);
          }
          else if($scope.showSearchInfo=="error") {
            var reHeight = $(".card-search-error").offset().top + 1;
            var reWidth = 0; //$(window).width() - $(".card-content").width();
            divResize("card-search-error",reHeight, reWidth);
          }
          else {
            var targetClass = "card-research-" + $scope.showSearchInfo;
            var reSHeight = $("." + targetClass).offset().top + 1;
            var reSWidth = 0; //$(window).width() - $(".card-content").width();
            divResize(targetClass,reSHeight, reSWidth);
          }  
        },500);
      }
















      $scope.downloadAuditLog = function() {
        $scope.auditSearchCondition = new Object();
        $scope.auditSearchCondition.searchType = "download"
        makeAuditLog();
      }



      $scope.logSearchDownload = function() {
        if ($scope.logSearchTotalCount != 0) {
          $('.answer-download').modal();
  
          $('.answer-download answer-exportes-transaction')[0].setId(logSearchInstance.getId(), $scope.logSearchTotalCount);
          $('.answer-download answer-exportes-transaction')[0].init();
          socket.send('com.logpresso.core.msgbus.DbPlugin.getFields', { 'query_id':logSearchInstance.getId() }, pid)
          .success(function(m) {
            $('.answer-download answer-exportes-transaction')[0].setCols(m.body.fields, m.body.field_order, parseCount);
          })
          .failed(function(m, raw) {
            console.log(m, raw);
          })
  
          $('.answer-download answer-exportes-transaction')[0].addCloseEvent(function() {
            $(".answer-download").modal('hide');
          });
        }


      }


      $scope.detailSearchDownload = function () {
        $scope.auditSearchCondition = new Object();
        $scope.auditSearchCondition.searchType = "detaildownload";
        $scope.auditSearchCondition.searchServiceId = $scope.serviceID.trim();
        $scope.auditSearchCondition.searchAccount = $scope.user_info_gubun.trim();
        $scope.auditSearchCondition.ctime = $scope.CTIME;
        makeAuditLog();

        var wb = XLSX.utils.book_new();

        var headerSrv = [
          {"서비스/TR 영역":""}
        ];

        var intputJobName = "";
        switch($scope.jobName) {
          case "COR":
            intputJobName = "CORE";
          break;
          case "BP":
          case "HTS":
          case "ETCBP":
          case "WTS":
            intputJobName = "접속BP";
          break;
          default:
            intputJobName = $scope.jobName;
          break;
        }
        var contentSrv1 = [
          {
            "총길이":$scope.totalLength, 
            "헤더 길이":$scope.headerLength,
            "메시지 길이":$scope.messageLength,
            "유저데이터 길이":$scope.userdataLength,
            "처리유형":$scope.trTY,
            "업무영역":intputJobName,
            "호스트이름":$scope.hostName
          }
        ];
        var contentSrv2 = [
          {
            "고유식별번호":$scope.GUID,
            "Client Time":$scope.CTIME,
            "로그발생시각":$scope.SORT_TIME,
            "서비스식별자":$scope.serviceID,
            "서비스식별자(한글)":$scope.serviceName,
            "화면번호":$scope.screenNum,
            "메시지 버전":$scope.messageVersion
          }
        ]

        var headerSystem = [
          {"시스템정보영역":""}
        ]
        var contentSystem1 = [
          {
            "채널ID": $scope.channelId,
            "Machine ID": $scope.cmId,
            "UTime": $scope.uTime,
            "RqID": $scope.rqId,
            "RqHnd": $scope.rqHnd,
          }
        ]
        var contentSystem2 = [
          {
            "경유서버 IP": $scope.mmId,
            "IP": $scope.ip,
            "PMID": $scope.pmId,
            "MAC": $scope.mac,
            "Reserved": $scope.reserved,
          }
        ]

        var headerUserInfo = [
          {"사용자 정보":""}
        ]
        var contentUserInfo1 = [
          {
            "고객등급": $scope.user_level,
            "단말회사코드": $scope.user_company_code,
            "단말지점코드": $scope.user_branch_code,
            "단말영업소코드": $scope.user_biz_code,
            "부서코드": $scope.user_dept,
            "조작자계열사": $scope.user_oper_company
          }
        ]
        var contentUserInfo2 = [
          {
            "조작자사번": $scope.user_oper_empid,
            "인증정보": $scope.ssoauth,
            "고객정보구분": $scope.user_info_gubun,
            "로컬정보": $scope.locale,
            "스크린ID": $scope.screenID,
            "UIComID": $scope.uicomID
          }
        ]
        
        var headerUserStatus = [
          {"사용자 상태":""}
        ]
        var contentUserStats = [
          {
            "긴급": $scope.userFlag3[0],
            "연속": $scope.userFlag3[1],
            "Err": $scope.userFlag3[2],
            "수신": $scope.userFlag3[3],
            "암호": $scope.userFlag3[4],
            "전자서명": $scope.userFlag3[5],
            "메시지": $scope.userFlag3[6],
            "압축": $scope.userFlag3[7],
            "little/big": $scope.userFlag3[8],
            "사용자": $scope.userFlag3[9],
            "Hash": $scope.userFlag3[10],
            "패스워드": $scope.userFlag3[11],
          }
        ]

        var headerMessage = [
          {"메시지":""}
        ]
        var contentMessage = [
          {
            "메시지코드": $scope.message_code,
            "메시지영역": $scope.message_body
          }
        ]

        var ws1 = XLSX.utils.json_to_sheet(headerSrv);
        XLSX.utils.sheet_add_json(ws1, contentSrv1, {origin: 'A2'});
        XLSX.utils.sheet_add_json(ws1, contentSrv2, {origin: 'A4'});

        XLSX.utils.sheet_add_json(ws1, headerSystem, {origin: 'A8'});
        XLSX.utils.sheet_add_json(ws1, contentSystem1, {origin: 'A9'});
        XLSX.utils.sheet_add_json(ws1, contentSystem2, {origin: 'A11'});

        XLSX.utils.sheet_add_json(ws1, headerUserInfo, {origin: 'A15'});
        XLSX.utils.sheet_add_json(ws1, contentUserInfo1, {origin: 'A16'});
        XLSX.utils.sheet_add_json(ws1, contentUserInfo2, {origin: 'A18'});

        XLSX.utils.sheet_add_json(ws1, headerUserStatus, {origin: 'A22'});
        XLSX.utils.sheet_add_json(ws1, contentUserStats, {origin: 'A23'});

        XLSX.utils.sheet_add_json(ws1, headerMessage, {origin: 'A27'});
        XLSX.utils.sheet_add_json(ws1, contentMessage, {origin: 'A28'});

        XLSX.utils.book_append_sheet(wb, ws1, "Header Data");

        
        var userData = [];
        var loopCount = 10;
        var inputObj = new Object();
        
        // var ws2 = XLSX.utils.json_to_sheet(userDataHeader);
        if($scope.modalStart) {
          //console.log("Get Parse Data");
          if($scope.parseResult=="SUCCESS") getParseData(function() {
            $scope.modalStart = false;

            if($scope.userDataValue.length < 10) loopCount = $scope.userDataValue.length;
            for(var x=0; x<$scope.userDataFieldEn.length; x++) {
              inputObj[$scope.userDataFieldEn[x]] = $scope.userDataFieldKo[x];
            }
            userData.push(inputObj);
          
            for(var i=0; i<loopCount; i++) {
              inputObj = new Object();
              for(var j=0; j<$scope.userDataFieldEn.length; j++) {
                inputObj[$scope.userDataFieldEn[j]] = $scope.userDataValue[i][j];
              }
              userData.push(inputObj);
            }
            var ws2 = XLSX.utils.json_to_sheet(userData);
            XLSX.utils.book_append_sheet(wb, ws2, "User Data");

            var wout = XLSX.write(wb, {bookType:'xlsx', type:'binary'});
            saveAs(new Blob([s2ab(wout)], {type:"application/octet-stream"}), "거래로그상세내역.xlsx");
          });
        }

        else {
          if($scope.userDataValue.length < 10) loopCount = $scope.userDataValue.length;
          for(var x=0; x<$scope.userDataFieldEn.length; x++) {
            inputObj[$scope.userDataFieldEn[x]] = $scope.userDataFieldKo[x];
          }
          userData.push(inputObj);
        
          for(var i=0; i<loopCount; i++) {
            inputObj = new Object();
            for(var j=0; j<$scope.userDataFieldEn.length; j++) {
              inputObj[$scope.userDataFieldEn[j]] = $scope.userDataValue[i][j];
            }
            userData.push(inputObj);
          }
          var ws2 = XLSX.utils.json_to_sheet(userData);
          XLSX.utils.book_append_sheet(wb, ws2, "User Data");

          var wout = XLSX.write(wb, {bookType:'xlsx', type:'binary'});
          saveAs(new Blob([s2ab(wout)], {type:"application/octet-stream"}), "거래로그상세내역.xlsx");
        }
       
        function s2ab(s) {
          var buf = new ArrayBuffer(s.length);
          var view = new Uint8Array(buf);
          for(var i=0; i!=s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF;
          return buf;
        }
        
      }


      
      
      $scope.detailSearchDownloadTable = function() {
        var wb = XLSX.utils.book_new();

        XLSX.utils.book_append_sheet(wb, XLSX.utils.table_to_sheet(document.getElementById("table-service")), "서비스TR영역");
        XLSX.utils.book_append_sheet(wb, XLSX.utils.table_to_sheet(document.getElementById("table-system")), "시스템정보영역");
        XLSX.utils.book_append_sheet(wb, XLSX.utils.table_to_sheet(document.getElementById("table-user")), "사용자정보");
        XLSX.utils.book_append_sheet(wb, XLSX.utils.table_to_sheet(document.getElementById("table-user-status")), "사용자상태");
        XLSX.utils.book_append_sheet(wb, XLSX.utils.table_to_sheet(document.getElementById("table-message")), "메시지");
        XLSX.utils.book_append_sheet(wb, XLSX.utils.table_to_sheet(document.getElementById("table-time")), "Time Cnt");
        XLSX.utils.book_append_sheet(wb, XLSX.utils.table_to_sheet(document.getElementById("table-e2e")), "E2E 암호화");
        XLSX.utils.book_append_sheet(wb, XLSX.utils.table_to_sheet(document.getElementById("table-user-data")), "사용자데이터");

        var wout = XLSX.write(wb, {bookType:'xlsx', type:'binary'});
        function s2ab(s) {
          var buf = new ArrayBuffer(s.length);
          var view = new Uint8Array(buf);
          for(var i=0; i!=s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF;
          return buf;
        }
        saveAs(new Blob([s2ab(wout)], {type:"application/octet-stream"}), "거래로그상세내역.xlsx");
      }
  
      $scope.$on('$destroy', function() {
        console.log("Search Page Destroy");
        if(logSearchInstance!=null) {
          console.log("already log exist query")
          serviceLogdb.remove(logSearchInstance);
        }
        if(irsSearchInstance!=null) {
          console.log("already irs exist query")
          serviceLogdb.remove(irsSearchInstance);
        }

        if(tempReSearchInstance!=null) {
          console.log("already temp exist query")
          serviceLogdb.remove(tempReSearchInstance);
        }

        if(searchLimitInstance!=null) {
          console.log("already limit exist query")
          serviceLogdb.remove(searchLimitInstance);
        }

        if(errorSearchInstance!=null) {
          console.log("already error exist query")
          serviceLogdb.remove(errorSearchInstance);
        }

        if(searchWormInstance!=null) {
          console.log("already worm exist query")
          serviceLogdb.remove(searchWormInstance);
        }

         

        for(var i=0; i<$scope.reSearchMax; i++) {
          if(reSearchInstance[i]!=null) {
            console.log("already relog exist query", i)
            serviceLogdb.remove(reSearchInstance[i]);
          }
        }
      });
  
      $(function() {
        $(window).resize(function() {
          // console.log("resize");
          if($scope.showSearchInfo=="basic") {
            var reHeight = $(".card-search").offset().top + 1;
            var reWidth = 0; //$(window).width() - $(".card-content").width();
            divResize("card-search",reHeight, reWidth);
          }
          else if($scope.showSearchInfo=="error") {
            var reHeight = $(".card-search-error").offset().top + 1;
            var reWidth = 0; //$(window).width() - $(".card-content").width();
            divResize("card-search-error",reHeight, reWidth);
          }
          else {
            var targetClass = "card-research-" + $scope.showSearchInfo;
            var reSHeight = $("." + targetClass).offset().top + 1;
            var reSWidth = 0; //$(window).width() - $(".card-content").width();
            divResize(targetClass,reSHeight, reSWidth);
          }

        });
      });

      window.addEventListener('resize', function() {
        // console.log("resize browser");
        if($scope.showSearchInfo=="basic") {
          var reHeight = $(".card-search").offset().top + 1;
          var reWidth = 0; //$(window).width() - $(".card-content").width();
          divResize("card-search",reHeight, reWidth);
        }
        else if($scope.showSearchInfo=="error") {
          var reHeight = $(".card-search-error").offset().top + 1;
          var reWidth = 0; //$(window).width() - $(".card-content").width();
          divResize("card-search-error",reHeight, reWidth);
        }
        else {
          var targetClass = "card-research-" + $scope.showSearchInfo;
          var reSHeight = $("." + targetClass).offset().top + 1;
          var reSWidth = 0; //$(window).width() - $(".card-content").width();
          divResize(targetClass,reSHeight, reSWidth);
        }
      }, true);


      $scope.toggleSearchCondition = function(type) {
        if(type=="basic") $scope.isSearchCondition = !$scope.isSearchCondition;
        else $scope.isReSearchCondition = !$scope.isReSearchCondition;
        $timeout(function() {
          if($scope.showSearchInfo=="basic") {
            var reHeight = $(".card-search").offset().top + 1;
            var reWidth = 0; //$(window).width() - $(".card-content").width();
            divResize("card-search",reHeight, reWidth);
          }
          else if($scope.showSearchInfo=="error") {
            var reHeight = $(".card-search-error").offset().top + 1;
            var reWidth = 0; //$(window).width() - $(".card-content").width();
            divResize("card-search-error",reHeight, reWidth);
          }
          else {
            var targetClass = "card-research-" + $scope.showSearchInfo;
            var reSHeight = $("." + targetClass).offset().top + 1;
            var reSWidth = 0; //$(window).width() - $(".card-content").width();
            divResize(targetClass,reSHeight, reSWidth);
          }  
        },500);
        
        
      }


      // function makeExcelData(tableArray) {
      //   console.log(tableArray)
      //   var retArray = new Array();
  
      //   for(var i=0; i<tableArray.result.length; i++) {
      //     var retObj = new Object();
      //     for( var j=0; j<tableArray.field.length; j++) {
      //       //var objName = tableArray.field[j].key;
      //       var objName = tableArray.field[j];
      //       retObj[objName] = tableArray.result[i][objName];
      //     }
      //     retArray.push(retObj);
      //   }
      //   return retArray;
      // }
  
      // $scope.saveReportExcel = function() {
      //   var wb = XLSX.utils.book_new();
  
      //   var logSearchExcel = new Object();
      //   logSearchExcel.field = $scope.statSearchField;
      //   logSearchExcel.result = $scope.statSearchResult;
  
      //   var inputStatData = makeExcelData(logSearchExcel);
  
      //   var statData = XLSX.utils.json_to_sheet(inputStatData);
  
      //   XLSX.utils.book_append_sheet(wb, statData, "POS 통계");
      //   var wbout = XLSX.write(wb, {bookType:'xlsx', type:'binary'});
  
      //   /* generate a download */
      //   function s2ab(s) {
      //     var buf = new ArrayBuffer(s.length);
      //     var view = new Uint8Array(buf);
      //     for (var i=0; i!=s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF;
      //     return buf;
      //   }
  
      //   saveAs(new Blob([s2ab(wbout)],{type:"application/octet-stream"}), "Report.xlsx");
      // }


















    var reSearchInstance = new Array();
    var reSearchQuery = new Array();


    function reSearchInit() {
      // console.log("Start Init")
      $scope.reSearchInfo = new Array();
      $scope.reSearchMax = 3;

      $scope.reSearchTargetField = "";
      $scope.reSearchTargetValue = "";

      $scope.reSearchDurationValue = "";
      $scope.reSearchDurationType ="eq"

      $scope.reSearchResult = new Array();

      reSearchInstance = new Array();
      reSearchQuery = new Array();

      $scope.reSearchPageSize = new Array();
      $scope.reSearchTotalCount = new Array();
      $scope.reSearchPagerPageSize = new Array();
      $scope.reSearchCurrentStart = new Array();
      $scope.reSearchCurrentPage = new Array();
      $scope.reSearchJumpNumber = new Array();

      $scope.reSearchPaginationArray = new Array();
      $scope.reSearchPaginationCount = new Array();
      $scope.reSearchShowPage = new Array();
      $scope.reSearchFields= new Array();

      for(var i=0; i<$scope.reSearchMax; i++) {
        reSearchInstance[i] = null;
        reSearchQuery[i] = null;

        $scope.reSearchPageSize[i] = $scope.searchPage;
        $scope.reSearchTotalCount[i] = 0;
        $scope.reSearchPagerPageSize[i] = 10;
        $scope.reSearchCurrentStart[i] = 1;
        $scope.reSearchCurrentPage[i] = 1;
        $scope.reSearchJumpNumber[i] = 1;
      }
      $scope.showSearchInfo = "basic";

      if(tempReSearchInstance!=null) {
        console.log("already temp exist query")
        serviceLogdb.remove(tempReSearchInstance);
      }
    }

    

    $scope.reSearchReset = function () {
      for(var i=0; i<$scope.reSearchMax; i++) {
        if(reSearchInstance[i]!=null) {
          console.log("already relog exist query", i)
          serviceLogdb.remove(reSearchInstance[i]);
        }
      }

      reSearchInit();
      lastQueryID = logSearchInstance.getId();
    }



    reSearchInit()
    
    $scope.showQueryResult = function(type) {
      if(type=="basic") {
        $timeout(function() {
          var reHeight = $(".card-search").offset().top + 1;
          var reWidth = 0; //$(window).width() - $(".card-content").width();
          divResize("card-search",reHeight, reWidth);
        }, 500);
        
      }
      else if(type=="error") {
        $timeout(function() {
          var reHeight = $(".card-search-error").offset().top + 1;
          var reWidth = 0; //$(window).width() - $(".card-content").width();
          divResize("card-search-error",reHeight, reWidth);
        }, 500);
        
      }
      else {
        $timeout(function() {
          var targetClass = "card-research-" + type;
          var reSHeight = $("." + targetClass).offset().top + 1;
          var reSWidth = 0; //$(window).width() - $(".card-search").width();
          divResize(targetClass,reSHeight, reSWidth);
        }, 500);
      }
      
      
      $scope.showSearchInfo = type;
    }
    $scope.reSearchAction = function() {
      if(lastQueryID==null) {
        swal("Search First");
        return;
      }
      if($scope.reSearchInfo.length >= $scope.reSearchMax) {
        swal("재검색은 3번까지 가능 합니다.");
        return;
      }

      // console.log("lastQueryID", lastQueryID);
      // console.log("logSearchInstance", logSearchInstance.getId());
      // if(reSearchInstance[0]!=null) console.log("reSearchInstance[0]", reSearchInstance[0].getId());
      // if(reSearchInstance[1]!=null) console.log("reSearchInstance[1]", reSearchInstance[1].getId());
      // if(reSearchInstance[2]!=null) console.log("reSearchInstance[2]", reSearchInstance[2].getId());
      // if(errorSearchInstance!=null) console.log("errorSearchInstance", errorSearchInstance.getId());



      // if($scope.reSearchTargetField=="" || $scope.reSearchTargetValue=="") {
      //   swal("재검색 조건을 입력해 주세요.");
      //   return;
      // }

      var reSearchInfoObj = new Object();
      reSearchInfoObj.field = $scope.reSearchTargetField;
      reSearchInfoObj.value = $scope.reSearchTargetValue;
      $scope.reSearchInfo.push(reSearchInfoObj);
      reSearchSubmit($scope.reSearchInfo.length -1);

      $scope.showSearchInfo = $scope.reSearchInfo.length -1;
    }

    function reSearchSubmit(counter) {
      loading(true, "logSearchPanel");
      console.log(lastQueryID, counter)
      // reSearchInstance[counter] = null;
      // reSearchQuery[counter] = null;

      if(reSearchInstance[counter]!=null) {
        console.log("already relog exist query ", counter)
        serviceLogdb.remove(reSearchInstance[counter]);
      }

      $scope.auditSearchCondition = new Object();
      $scope.auditSearchCondition.searchType = "research";
      $scope.auditSearchCondition.researchCounter = counter + 1;
      $scope.auditSearchCondition[$scope.reSearchInfo[counter].field] = $scope.reSearchInfo[counter].value;

      var reSearchQuery = "";
      var reQuerySB = new StringBuilder();
      reQuerySB.AppendFormat(" result {0}",  lastQueryID);
      if($scope.reSearchInfo[counter].value!="") {
        if($scope.reSearchInfo[counter].field=="서비스식별자") reQuerySB.AppendFormat(" | search {0} == \"{1}\"", $scope.reSearchInfo[counter].field, $scope.reSearchInfo[counter].value);
        else if($scope.reSearchInfo[counter].field=="업무영역") {
          // switch($scope.reSearchInfo[counter].value) {
          //   case "HTS/MTS":
          //     $scope.reSearchInfo[counter].value = "HTS";
          //   break;
          //   case "CORE":
          //     $scope.reSearchInfo[counter].value = "COR";
          //   break;
          //   default:
          //     $scope.reSearchInfo[counter].value = $scope.reSearchInfo[counter].value;
          //   break;
          // }

          //20201208 BP HTS WTS 통합 by chris
          var splitArea = $scope.reSearchInfo[counter].value.split("_");
          if(splitArea[0]=="CNTBP") {
            // 20201209 쿼리 변경으로 검색조건 수정 by chris
            //reQuerySB.AppendFormat(" | search ( 업무영역==\"{0}\" or 업무영역==\"{1}\" or 업무영역==\"{2}\" or 업무영역==\"{3}\" )", "BP", "HTS", "ETCBP", "WTS");
            reQuerySB.AppendFormat(" | search  업무영역==\"{0}\"", "접속BP");
          }
          else if(splitArea[0]=="COR") {
            reQuerySB.AppendFormat(" | search  업무영역==\"{0}\"", "CORE");
          }
          else {
            reQuerySB.AppendFormat(" | search {0} == \"{1}\"", $scope.reSearchInfo[counter].field, $scope.reSearchInfo[counter].value);
          }

          if(splitArea.length == 2) reQuerySB.Append(" and succTY == \"ERR\"");
          else reQuerySB.Append(" and succTY == \"SUCC\"");
        }
        else reQuerySB.AppendFormat(" | search {0} == \"*{1}*\"", $scope.reSearchInfo[counter].field, $scope.reSearchInfo[counter].value);
      }


      if($scope.reSearchDurationValue!="") {
        var searchDurationType = "==";
        var searchDurationStr = "같음";
        if($scope.reSearchDurationType=="qt") {
          searchDurationType = ">";
          searchDurationStr = "초과"
        }
        else if($scope.reSearchDurationType=="lt") {
          searchDurationType = "<";
          searchDurationStr = "미만"
        }

        reQuerySB.AppendFormat(" | search 시간간격 {0} {1}", searchDurationType, $scope.reSearchDurationValue)
        $scope.auditSearchCondition.searchDurationType = searchDurationStr;
        $scope.auditSearchCondition.searchDurationValue = $scope.reSearchDurationValue;
      }

      reSearchQuery = reQuerySB.ToString();
      console.log("ReQuery", reSearchQuery);

      tempReSearchInstance = serviceLogdb.create(pid);
      tempReSearchQuery = tempReSearchInstance.query(reSearchQuery, $scope.searchPage);
      try {
        tempReSearchQuery
          .started(function(m) {
            //console.log("re start",m)
          })
          .onHead(function(helper) {
            helper.getResult(function(message) {
              //console.log("re head", message);
              $scope.$apply();
            });
          })
          .onStatusChange(function(message) {
            //console.log("re change", message);
            $scope.reSearchTotalCount[counter] = message.body.count;
            reSearchInstance[counter] = tempReSearchInstance;

            reSearchInstance[counter].getResult(0, $scope.reSearchPageSize[counter], function(message) {
              //console.log("change", message);

              var fieldTypeArray = new Array();
              var fieldOrderArray = new Array();
              var tempArray = new Array();
              $scope.reSearchFields[counter] = new Array();

              for (var key in message.body.field_types) {
                if (tempArray.findIndex(obj => obj.key == key) === -1) tempArray.push({"key":key,"val":message.body.field_types[key]});
                if(key!="_table") fieldTypeArray.push(key);
                if(key=="_id" || key=="_time") fieldOrderArray.push(key);
              }
              fieldTypeArray.sort();
              if(typeof message.body.field_order != "undefined") {
                for(var i=0; i<message.body.field_order.length; i++) {
                  if(message.body.field_order[i]!="_id" && message.body.field_order[i]!="_time" && message.body.field_order[i]!="_table") fieldOrderArray.push(message.body.field_order[i]);
                }
              }

              var diffArray = array_diff(fieldTypeArray,fieldOrderArray);
              var finalArray = union(fieldOrderArray,diffArray);


              for(var i=0;i<finalArray.length; i++) {
                var fieldData = tempArray.find(obj => obj.key === finalArray[i]);
                if(typeof fieldData !== "undefined") $scope.reSearchFields[counter].push(fieldData);
              }

              $scope.tdWidth = $scope.tableWidth / $scope.reSearchFields[counter].length;
              if($scope.tdWidth < 100) $scope.tdWidth = 100;
              $scope.reSearchInfo[counter].result = message.body.result;

              // for(var i=0; i<counter+1; i++) {
                $timeout(function() {
                  var targetClass = "card-research-" + counter;
                  var reHeight = $("." + targetClass).offset().top + 1;
                  var reWidth = 0; //$(window).width() - $("." + targetClass).width();
                  divResize(targetClass,reHeight, reWidth);
                },500);
              // }
              $scope.$apply()
            });

            makeReSearchPaginationInfo(counter);
            $scope.$apply();
          })
          .onTail(function(helper) {
            helper.getResult(function(message) {
              //console.log("re tail", message);
              reSearchInstance[counter] = tempReSearchInstance
              reSearchInstance[counter].getResult(0, $scope.reSearchPageSize[counter], function(message) {
              var fieldTypeArray = new Array();
              var fieldOrderArray = new Array();
              var tempArray = new Array();
              $scope.reSearchFields[counter] = new Array();

              for (var key in message.body.field_types) {
                if (tempArray.findIndex(obj => obj.key == key) === -1) tempArray.push({"key":key,"val":message.body.field_types[key]});
                if(key!="_table") fieldTypeArray.push(key);
                if(key=="_id" || key=="_time") fieldOrderArray.push(key);
              }
              fieldTypeArray.sort();
              if(typeof message.body.field_order != "undefined") {
                for(var i=0; i<message.body.field_order.length; i++) {
                  if(message.body.field_order[i]!="_id" && message.body.field_order[i]!="_time" && message.body.field_order[i]!="_table") fieldOrderArray.push(message.body.field_order[i]);
                }
              }

              var diffArray = array_diff(fieldTypeArray,fieldOrderArray);
              var finalArray = union(fieldOrderArray,diffArray);

              for(var i=0;i<finalArray.length; i++) {
                var fieldData = tempArray.find(obj => obj.key === finalArray[i]);
                if(typeof fieldData !== "undefined") $scope.reSearchFields[counter].push(fieldData);
              }

              $scope.tdWidth = $scope.tableWidth / $scope.logSearchFields.length;
              if($scope.tdWidth < 100) $scope.tdWidth = 100;
              $scope.reSearchInfo[counter].result = message.body.result;

              // for(var i=0; i<counter+1; i++) {
                $timeout(function() {
                  var targetClass = "card-research-" + counter;
                  console.log("targetClass", targetClass)
                  var reHeight = $("." + targetClass).offset().top + 1;
                  var reWidth = 0; //$(window).width() - $("." + targetClass).width();
                  divResize(targetClass,reHeight, reWidth);
                },500);
              // }

              $scope.$apply()
            });

            $scope.reSearchTotalCount[counter] = helper.message.body.total_count;

            // downloadInstance = logSearchInstance.getId();
            // downloadCount = helper.message.body.total_count;

            makeReSearchPaginationInfo(counter);
            $scope.$apply();
            });
          })
          .loaded(function(m) {
            //console.log("re load",m)
            loading(false, "logSearchPanel");
            lastQueryID = m.body.id;
            $scope.auditSearchCondition.lastQueryID = lastQueryID;
            $scope.auditSearchCondition.searchCount = m.body.total_count;
            makeAuditLog();
          })
          .failed(function(raw, type, note) {
            console.log("re fail",raw, type, note)
          });

        serviceLogdb.remove(tempReSearchInstance);
      } catch (e) {
        console.log(e);
      }
      reSearchInstance[counter] = tempReSearchInstance
    }





    /* ---------------------------------------------------------------------------------------------------------------------
    * Pagination Set Start
    * ---------------------------------------------------------------------------------------------------------------------*/


    function makeReSearchPaginationInfo(counter) {
      // console.log("counter", counter,$scope.reSearchTotalCount, $scope.reSearchPageSize)
      $scope.reSearchPaginationArray[counter] = [];
      var arrayCount = 0;

      if ($scope.reSearchTotalCount[counter] > 0)
        $scope.reSearchPaginationCount[counter] = Math.ceil($scope.reSearchTotalCount[counter] / $scope.reSearchPageSize[counter]);
      else
        $scope.reSearchPaginationCount[counter] = 1;

      var showPageNumber = 0;

      if ($scope.reSearchPaginationCount[counter] > $scope.reSearchPagerPageSize[counter]) arrayCount = $scope.reSearchPagerPageSize[counter];
      else arrayCount = $scope.reSearchPaginationCount[counter];

      //console.log("###", $scope.reSearchPaginationCount[counter], $scope.reSearchPagerPageSize[counter], $scope.reSearchCurrentStart[counter])

      for (var i = 0; i < arrayCount; i++) {
        $scope.reSearchShowPage[counter] = $scope.reSearchCurrentStart[counter] + i;
        if ($scope.reSearchPaginationCount[counter] >= $scope.reSearchShowPage[counter])
          $scope.reSearchPaginationArray[counter].push($scope.reSearchShowPage[counter]);
        else break;
      }
    }

    $scope.reSearchPageChanged = function(number, counter) {
      var idx = number - 1;
      $scope.reSearchCurrentPage[counter] = number;
      $scope.reSearchCurrentStart[counter] = (Math.ceil($scope.reSearchCurrentPage[counter] / $scope.reSearchPagerPageSize[counter]) - 1) * $scope.reSearchPagerPageSize[counter] + 1;

      reSearchInstance[counter].getResult(idx * $scope.reSearchPageSize[counter], $scope.reSearchPageSize[counter], function(message) {
        var fieldTypeArray = new Array();
        var fieldOrderArray = new Array();
        var tempArray = new Array();
        $scope.reSearchFields[counter] = new Array();

        for (var key in message.body.field_types) {
          if (tempArray.findIndex(obj => obj.key == key) === -1) tempArray.push({"key":key,"val":message.body.field_types[key]});
          if(key!="_table") fieldTypeArray.push(key);
          if(key=="_id" || key=="_time") fieldOrderArray.push(key);
        }
        fieldTypeArray.sort();
        if(typeof message.body.field_order != "undefined") {
          for(var i=0; i<message.body.field_order.length; i++) {
            if(message.body.field_order[i]!="_id" && message.body.field_order[i]!="_time" && message.body.field_order[i]!="_table") fieldOrderArray.push(message.body.field_order[i]);
          }
        }

        var diffArray = array_diff(fieldTypeArray,fieldOrderArray);
        var finalArray = union(fieldOrderArray,diffArray);


        for(var i=0;i<finalArray.length; i++) {
          var fieldData = tempArray.find(obj => obj.key === finalArray[i]);
          if(typeof fieldData !== "undefined") $scope.reSearchFields[counter].push(fieldData);
        }

        $scope.tdWidth = $scope.tableWidth / $scope.reSearchFields[counter].length;
        if($scope.tdWidth < 100) $scope.tdWidth = 100;
        $scope.reSearchInfo[counter].result = message.body.result;
        $scope.$apply()
      });
      makeReSearchPaginationInfo(counter);
    }

    $scope.reSearchJumpNext = function(counter) {
      $scope.reSearchCurrentPage[counter] = $scope.reSearchCurrentPage[counter] + $scope.reSearchPagerPageSize[counter];
      if ($scope.reSearchCurrentPage[counter] > $scope.reSearchPaginationCount[counter]) {
        $scope.reSearchCurrentPage[counter] = $scope.reSearchPaginationCount[counter];
      }
      $scope.reSearchPageChanged($scope.reSearchCurrentPage[counter], counter);
    }

    $scope.reSearchPageNext = function(counter) {
      $scope.reSearchCurrentPage[counter] = $scope.reSearchCurrentPage[counter] + 1;
      if ($scope.reSearchCurrentPage[counter] > $scope.reSearchPaginationCount[counter]) {
        $scope.reSearchCurrentPage[counter] = $scope.reSearchCurrentPage[counter] - 1;
      } else {
        $scope.reSearchPageChanged($scope.reSearchCurrentPage[counter], counter);
      }
    }

    $scope.reSearchJumpPrev = function(counter) {
      $scope.reSearchCurrentPage[counter] = $scope.reSearchCurrentPage[counter] - $scope.reSearchPagerPageSize[counter];
      if ($scope.reSearchCurrentPage[counter] < 1) {
        $scope.reSearchCurrentPage[counter] = 1;
      }
      $scope.reSearchPageChanged($scope.reSearchCurrentPage[counter], counter);
    }

    $scope.reSearchPagePrev = function(counter) {
      $scope.reSearchCurrentPage[counter] = $scope.reSearchCurrentPage[counter] - 1;
      if ($scope.reSearchCurrentPage[counter] < 1) {
        $scope.reSearchCurrentPage[counter] = $scope.reSearchCurrentPage[counter] + 1;
      } else {
        $scope.reSearchPageChanged($scope.reSearchCurrentPage[counter], counter);
      }
    }
    /* ---------------------------------------------------------------------------------------------------------------------
    * Pagination Set End
    * ---------------------------------------------------------------------------------------------------------------------*/

   $scope.reLogSearchDownload = function(counter) {
    if ($scope.reSearchTotalCount[counter] != 0) {
      $('.answer-download').modal();

      $('.answer-download answer-exportes-transaction')[0].setId(reSearchInstance[counter].getId(), $scope.reSearchTotalCount[counter]);
      $('.answer-download answer-exportes-transaction')[0].init();
      socket.send('com.logpresso.core.msgbus.DbPlugin.getFields', { 'query_id':reSearchInstance[counter].getId() }, pid)
      .success(function(m) {
        $('.answer-download answer-exportes-transaction')[0].setCols(m.body.fields, m.body.field_order, parseCount);
      })
      .failed(function(m, raw) {
        console.log(m, raw);
      })

      $('.answer-download answer-exportes-transaction')[0].addCloseEvent(function() {
        $(".answer-download").modal('hide');
      });
    }


  }


  $scope.deleteResearchTab = function (idx) {
    // console.log("Delete Tab", idx)

    var title = "재검색 삭제";
    var text = "선택한 재검색 내용을 삭제 하시겠습니까?"

    swal({
      title: title,
      text: text,
      type: "warning",
      showCancelButton: true,
      confirmButtonClass: "btn-danger",
      confirmButtonText: "확인",
      cancelButtonText: "취소",
      closeOnConfirm: true,
      closeOnCancel: true
    },
    function(isConfirm) {
      if (isConfirm) {
        console.log("Confirm Delete Tab", idx)

        for(var i=idx; i<$scope.reSearchMax; i++) {
          if(reSearchInstance[i]!=null) {
            console.log("already relog exist query", i)
            serviceLogdb.remove(reSearchInstance[i]);
          }
        }
        if(idx == 0) {
          lastQueryID = logSearchInstance.getId();
          $scope.showSearchInfo = 'basic';
        }
        else {
          lastQueryID = reSearchInstance[idx - 1].getId();
          $scope.showSearchInfo = idx -1;
        }

        // console.log("lastQueryID", lastQueryID);

        reSearchInstance.splice(idx, reSearchInstance.length - idx);
        reSearchQuery.splice(idx, reSearchQuery.length - idx);

        $scope.reSearchInfo.splice(idx, $scope.reSearchInfo.length - idx);
        $scope.reSearchResult.splice(idx, $scope.reSearchResult.length - idx);

        $scope.reSearchPageSize.splice(idx, $scope.reSearchPageSize.length - idx);
        $scope.reSearchTotalCount.splice(idx, $scope.reSearchTotalCount.length - idx);
        $scope.reSearchPagerPageSize.splice(idx, $scope.reSearchPagerPageSize.length - idx);
        $scope.reSearchCurrentStart.splice(idx, $scope.reSearchCurrentStart.length - idx);
        $scope.reSearchCurrentPage.splice(idx, $scope.reSearchCurrentPage.length - idx);
        $scope.reSearchJumpNumber.splice(idx, $scope.reSearchJumpNumber.length - idx);

        $scope.reSearchPaginationArray.splice(idx, $scope.reSearchPaginationArray.length - idx);
        $scope.reSearchPaginationCount.splice(idx, $scope.reSearchPaginationCount.length - idx);
        $scope.reSearchShowPage.splice(idx, $scope.reSearchShowPage.length - idx);
        $scope.reSearchFields.splice(idx, $scope.reSearchFields.length - idx);

        for(var i=idx; i<$scope.reSearchMax; i++) {
          reSearchInstance[i] = null;
          reSearchQuery[i] = null;
  
          $scope.reSearchPageSize[i] = $scope.searchPage;
          $scope.reSearchTotalCount[i] = 0;
          $scope.reSearchPagerPageSize[i] = 10;
          $scope.reSearchCurrentStart[i] = 1;
          $scope.reSearchCurrentPage[i] = 1;
          $scope.reSearchJumpNumber[i] = 1;
        }

        $timeout(function() {
          var reHeight = $(".card-search").offset().top + 1;
          var reWidth = 0; //$(window).width() - $(".card-content").width();
          divResize("card-search",reHeight, reWidth);
        }, 500);

        $scope.$apply();

      } 
    });
  }

















  /* ---------------------------------------------------------------------------------------------------------------------
  * Pagination Set Start
  * ---------------------------------------------------------------------------------------------------------------------*/
  $scope.errorSearchPageSize = $scope.searchPage;
  $scope.errorSearchTotalCount = 0;
  $scope.errorSearchPagerPageSize = 10;
  $scope.errorSearchCurrentStart = 1;
  $scope.errorSearchCurrentPage = 1;
  $scope.errorSearchJumpNumber = 1;

  function makeErrorSearchPaginationInfo() {
    $scope.errorSearchPaginationArray = [];
    var arrayCount = 0;

    if ($scope.errorSearchTotalCount > 0)
      $scope.errorSearchPaginationCount = Math.ceil($scope.errorSearchTotalCount / $scope.errorSearchPageSize);
    else
      $scope.errorSearchPaginationCount = 1;

    var showPageNumber = 0;

    if ($scope.errorSearchPaginationCount > $scope.errorSearchPagerPageSize) arrayCount = $scope.errorSearchPagerPageSize;
    else arrayCount = $scope.errorSearchPaginationCount;

    for (var i = 0; i < arrayCount; i++) {
      $scope.errorSearchShowPage = $scope.errorSearchCurrentStart + i;
      if ($scope.errorSearchPaginationCount >= $scope.errorSearchShowPage)
        $scope.errorSearchPaginationArray.push($scope.errorSearchShowPage);
      else break;
    }
  }

  $scope.errorSearchPageChanged = function(number) {
    var idx = number - 1;
    $scope.errorSearchCurrentPage = number;
    $scope.errorSearchCurrentStart = (Math.ceil($scope.errorSearchCurrentPage / $scope.errorSearchPagerPageSize) - 1) * $scope.errorSearchPagerPageSize + 1;

    errorSearchInstance.getResult(idx * $scope.errorSearchPageSize, $scope.errorSearchPageSize, function(message) {
      var fieldTypeArray = new Array();
      var fieldOrderArray = new Array();
      var tempArray = new Array();
      $scope.errorSearchFields = new Array();

      for (var key in message.body.field_types) {
        if (tempArray.findIndex(obj => obj.key == key) === -1) tempArray.push({"key":key,"val":message.body.field_types[key]});
        if(key!="_table") fieldTypeArray.push(key);
        if(key=="_id" || key=="_time") fieldOrderArray.push(key);
      }
      fieldTypeArray.sort();
      if(typeof message.body.field_order != "undefined") {
        for(var i=0; i<message.body.field_order.length; i++) {
          if(message.body.field_order[i]!="_id" && message.body.field_order[i]!="_time" && message.body.field_order[i]!="_table") fieldOrderArray.push(message.body.field_order[i]);
        }
      }

      var diffArray = array_diff(fieldTypeArray,fieldOrderArray);
      var finalArray = union(fieldOrderArray,diffArray);


      for(var i=0;i<finalArray.length; i++) {
        var fieldData = tempArray.find(obj => obj.key === finalArray[i]);
        if(typeof fieldData !== "undefined") $scope.errorSearchFields.push(fieldData);
      }

      $scope.tdWidth = $scope.tableWidth / $scope.errorSearchFields.length;
      if($scope.tdWidth < 100) $scope.tdWidth = 100;
      $scope.errorSearchResult = message.body.result;
      $scope.$apply()
    });
    makeErrorSearchPaginationInfo();
  }

  $scope.errorSearchJumpNext = function() {
    $scope.errorSearchCurrentPage = $scope.errorSearchCurrentPage + $scope.errorSearchPagerPageSize;
    if ($scope.errorSearchCurrentPage > $scope.errorSearchPaginationCount) {
      $scope.errorSearchCurrentPage = $scope.errorSearchPaginationCount;
    }
    $scope.errorSearchPageChanged($scope.errorSearchCurrentPage);
  }

  $scope.errorSearchPageNext = function() {
    $scope.errorSearchCurrentPage = $scope.errorSearchCurrentPage + 1;
    if ($scope.errorSearchCurrentPage > $scope.errorSearchPaginationCount) {
      $scope.errorSearchCurrentPage = $scope.errorSearchCurrentPage - 1;
    } else {
      $scope.errorSearchPageChanged($scope.errorSearchCurrentPage);
    }
  }

  $scope.errorSearchJumpPrev = function() {
    $scope.errorSearchCurrentPage = $scope.errorSearchCurrentPage - $scope.errorSearchPagerPageSize;
    if ($scope.errorSearchCurrentPage < 1) {
      $scope.errorSearchCurrentPage = 1;
    }
    $scope.errorSearchPageChanged($scope.errorSearchCurrentPage);
  }

  $scope.errorSearchPagePrev = function() {
    $scope.errorSearchCurrentPage = $scope.errorSearchCurrentPage - 1;
    if ($scope.errorSearchCurrentPage < 1) {
      $scope.errorSearchCurrentPage = $scope.errorSearchCurrentPage + 1;
    } else {
      $scope.errorSearchPageChanged($scope.errorSearchCurrentPage);
    }
  }
  /* ---------------------------------------------------------------------------------------------------------------------
  * Pagination Set End
  * ---------------------------------------------------------------------------------------------------------------------*/




  $scope.searchErrorLog = function() {
    // console.log("ERROR LOG SEARCH")
    loading(true, "errorSearchPanel");
    $scope.isErrorSearch = true;
    $scope.errorSearchCurrentStart = 1;
    $scope.errorSearchCurrentPage = 1;
    $scope.errorSearchJumpNumber = 1;

    if(errorSearchInstance!=null) {
      console.log("already log exist query")
      serviceLogdb.remove(errorSearchInstance);
    }


    // var searchStartDate = $("#searchStartDate").val();
    // var searchEndDate = $("#searchEndDate").val();

    // $scope.auditSearchCondition.searchstartDate = searchStartDate;
    // $scope.auditSearchCondition.searchEndDate = searchEndDate;

    // var startMoment = moment(searchStartDate);
    // var endMoment = moment(searchEndDate);

    // var timeDiff = moment.duration(endMoment.diff(startMoment)).asSeconds();
    // if(timeDiff < 0) {
    //   //Enter Key 입력시 alert 창이 바로 닫히는 문제
    //   $timeout(function() {
    //     swal("거래로그조회", "검색 일자를 확인해 주세요", "warning");
    //   }, 100);
    //   return;
    // }

    var startErrorMoment = moment($scope.orgSearchStartDate);
    var endErrorMoment = moment($scope.orgSearchEndDate);

    var addStartErrorMoment = startErrorMoment.add(-1,"m").format("YYYY-MM-DD HH:mm:ss");
    var addEndErrorMoment = endErrorMoment.add(1,"m").format("YYYY-MM-DD HH:mm:ss");
    
    var searchFromStr = "from=" + addStartErrorMoment.replace(/-/g, "").replace(/ /g, "").replace(/:/g, "");
    var searchToStr = "to=" + addEndErrorMoment.replace(/-/g, "").replace(/ /g, "").replace(/:/g, "");
    

    var fianlQuery = "";
    var querySB = new StringBuilder();


    querySB.AppendFormat(" fulltext {0} {1} _tt=t", searchFromStr, searchToStr);
    querySB.AppendFormat(" [ result {0} | fields GUID_KEY ] from {1} ", orgQueryID, $scope.tableTransaction);
    querySB.Append(" | fields - USERDATA, INFOWAY, decompressData, _filepath, _filetag, _host, _id, _table, INFOWAY_STR, line")
    querySB.Append(" | eval serviceID = trim(SERVICEID)")
    querySB.AppendFormat(" | lookup {0} serviceID output serviceName", $scope.lookupIRS)
    querySB.Append(" | eval UTIME_STR=concat(string(epoch(long(left(UTIME, 13))), \"yyyyMMddHHmmssSSS\"), right(UTIME,3))");
    querySB.Append(" | eval CTIME=concat(string(epoch(long(left(UTIME, 13))), \"yyyy-MM-dd HH:mm:ss SSS\"), right(UTIME,3))");
    querySB.Append(" | eval SORT_TIME=replace(SORT_TIME, \".\", \" \")");
    querySB.Append(" | eval 화면번호=concat(SCREENID,\"-\",UICOMID)");

    //20201209 jobName 통합 BP HTS WTS ETCBP => 접속BP  by chris
    querySB.AppendFormat(" | eval jobName = case( (jobName==\"{0}\" or jobName==\"{1}\" or jobName==\"{2}\" or jobName==\"{3}\"), \"접속BP\", jobName==\"{4}\", \"CORE\", jobName)", "BP", "HTS", "ETCBP", "WTS", "COR");

    querySB.Append(" | rename trTY as 처리유형, jobName as 업무영역, hostName as 호스트이름, CTIME as Client_Time, SORT_TIME as 로그발생시각, serviceID as 서비스식별자, serviceName as 서비스식별자(한글), GUID as 고유식별번호, USERDEPT as 접속자부서, USEROPEREMPID as 조작자사번, IP as 사용자IP, MAC as 맥주소, USERINFOGUBUN as 계좌번호, MESSAGECODE as 메시지코드, MESSAGEBODY as 메시지영역, MMID as 경유서버IP, duration as 시간간격");
    for(var i=0; i<parseCount; i++) {
      querySB.AppendFormat(", parseData{0} as 사용자데이터{1}", i+1, addZeroStr(i+1));
    }
    querySB.Append(" | order 처리유형, 업무영역, 호스트이름, Client_Time,  로그발생시각, 서비스식별자, 서비스식별자(한글),  화면번호, 고유식별번호,  접속자부서,  사용자IP, 맥주소, 계좌번호,  메시지코드, 메시지영역,  경유서버IP");
    for(var i=0; i<parseCount; i++) {
      querySB.AppendFormat(", 사용자데이터{0}", addZeroStr(i+1));
    }
    querySB.Append(" ]");
    querySB.Append(" | sort 고유식별번호, 처리유형");

    fianlQuery = querySB.ToString();

    if($scope.$parent.uid=="root" || $scope.$parent.uid=="dsadmin") {
      console.log("Run Error Query : " + fianlQuery);
    }

    $scope.errorSearchFields = [];
    $scope.errorSearchResult = [];
    $scope.btnErrFlag = "searching";
    $scope.showSearchInfo = "error";

    errorSearchInstance = serviceLogdb.create(pid);
    $scope.errorSearchPageSize = $scope.searchErrorPage;
    errorSearchQuery = errorSearchInstance.query(fianlQuery, $scope.searchErrorPage);

    try {
      errorSearchQuery
      .started(function(m) {
        //console.log("re start",m)
      })
      .onHead(function(helper) {
        helper.getResult(function(message) {
          //console.log("re head", message);
          $scope.$apply();
        });
      })
      .onStatusChange(function(message) {
        //console.log("re change", message);
        $scope.errorSearchTotalCount = message.body.count;

        errorSearchInstance.getResult(0, $scope.errorSearchPageSize, function(message) {
          //console.log("change", message);

          var fieldTypeArray = new Array();
          var fieldOrderArray = new Array();
          var tempArray = new Array();
          $scope.errorSearchFields = new Array();

          for (var key in message.body.field_types) {
            if (tempArray.findIndex(obj => obj.key == key) === -1) tempArray.push({"key":key,"val":message.body.field_types[key]});
            if(key!="_table") fieldTypeArray.push(key);
            if(key=="_id" || key=="_time") fieldOrderArray.push(key);
          }
          fieldTypeArray.sort();
          if(typeof message.body.field_order != "undefined") {
            for(var i=0; i<message.body.field_order.length; i++) {
              if(message.body.field_order[i]!="_id" && message.body.field_order[i]!="_time" && message.body.field_order[i]!="_table") fieldOrderArray.push(message.body.field_order[i]);
            }
          }

          var diffArray = array_diff(fieldTypeArray,fieldOrderArray);
          var finalArray = union(fieldOrderArray,diffArray);


          for(var i=0;i<finalArray.length; i++) {
            var fieldData = tempArray.find(obj => obj.key === finalArray[i]);
            if(typeof fieldData !== "undefined") $scope.errorSearchFields.push(fieldData);
          }

          $scope.tdWidth = $scope.tableWidth / $scope.errorSearchFields.length;
          if($scope.tdWidth < 100) $scope.tdWidth = 100;
          $scope.errorSearchResult = message.body.result;

          // for(var i=0; i<counter+1; i++) {
            $timeout(function() {
              var targetClass = "card-search-error";
              var reHeight = $("." + targetClass).offset().top + 1;
              var reWidth = 0; //$(window).width() - $("." + targetClass).width();
              divResize(targetClass,reHeight, reWidth);
            },500);
          // }
          $scope.$apply()
        });

        makeErrorSearchPaginationInfo();
        $scope.$apply();
      })
      .onTail(function(helper) {
        helper.getResult(function(message) {
          // console.log("error tail", message);
          errorSearchInstance.getResult(0, $scope.errorSearchPageSize, function(message) {
          var fieldTypeArray = new Array();
          var fieldOrderArray = new Array();
          var tempArray = new Array();
          $scope.errorSearchFields = new Array();

          for (var key in message.body.field_types) {
            if (tempArray.findIndex(obj => obj.key == key) === -1) tempArray.push({"key":key,"val":message.body.field_types[key]});
            if(key!="_table") fieldTypeArray.push(key);
            if(key=="_id" || key=="_time") fieldOrderArray.push(key);
          }
          fieldTypeArray.sort();
          if(typeof message.body.field_order != "undefined") {
            for(var i=0; i<message.body.field_order.length; i++) {
              if(message.body.field_order[i]!="_id" && message.body.field_order[i]!="_time" && message.body.field_order[i]!="_table") fieldOrderArray.push(message.body.field_order[i]);
            }
          }

          var diffArray = array_diff(fieldTypeArray,fieldOrderArray);
          var finalArray = union(fieldOrderArray,diffArray);

          for(var i=0;i<finalArray.length; i++) {
            var fieldData = tempArray.find(obj => obj.key === finalArray[i]);
            if(typeof fieldData !== "undefined") $scope.errorSearchFields.push(fieldData);
          }

          $scope.tdWidth = $scope.tableWidth / $scope.errorSearchFields.length;
          if($scope.tdWidth < 100) $scope.tdWidth = 100;
          $scope.errorSearchResult = message.body.result;

          // for(var i=0; i<counter+1; i++) {
            $timeout(function() {
              var targetClass = "card-search-error";
              var reHeight = $("." + targetClass).offset().top + 1;
              var reWidth = 0; //$(window).width() - $("." + targetClass).width();
              divResize(targetClass,reHeight, reWidth);
            },500);
          // }

          $scope.$apply()
        });

        $scope.errorSearchTotalCount = helper.message.body.total_count;

        makeErrorSearchPaginationInfo();
        $scope.$apply();
        });
      })
      .loaded(function(m) {
        //console.log("re load",m)
        $scope.btnErrFlag = "ready";
        loading(false, "errorSearchPanel");
        $scope.auditSearchCondition.lastQueryID = m.body.id;
        $scope.auditSearchCondition.searchCount = m.body.total_count;
        makeAuditLog();
      })
      .failed(function(raw, type, note) {
        $scope.btnErrFlag = "ready";
        loading(false, "errorSearchPanel");
        console.log("re fail",raw, type, note)
      });

      serviceLogdb.remove(errorSearchInstance);
    } catch (e) {
      console.log(e);
    }
  }

  $scope.searchErrorStop = function() {
    errorSearchInstance.stop();

    loading(false, "errorSearchPanel");
    $scope.btnErrFlag = "ready";
  }

  $scope.errorSearchDownload = function() {
    if ($scope.logSearchTotalCount != 0) {
      $('.answer-download').modal();

      $('.answer-download answer-exportes-transaction')[0].setId(errorSearchInstance.getId(), $scope.errorSearchTotalCount);
      $('.answer-download answer-exportes-transaction')[0].init();
      socket.send('com.logpresso.core.msgbus.DbPlugin.getFields', { 'query_id':errorSearchInstance.getId() }, pid)
      .success(function(m) {
        $('.answer-download answer-exportes-transaction')[0].setCols(m.body.fields, m.body.field_order, parseCount);
      })
      .failed(function(m, raw) {
        console.log(m, raw);
      })

      $('.answer-download answer-exportes-transaction')[0].addCloseEvent(function() {
        $(".answer-download").modal('hide');
      });
    }


  }










  
  function getSearchLimit() {
    if(searchLimitInstance!=null) {
      console.log("already search limit exist query ")
      serviceLogdb.remove(searchLimitInstance);
    }

    serviceSession.getCurrentUser()
    .success(function(m) {
      var userRole = m.body.user.ext.admin.role.name;
      // console.log("Set Log Search Role", $scope.uRole)

      var runLimitQuery = "proc procSearchLimitView(\"" + userRole + "\")";
      // console.log("Query", runLimitQuery)

      searchLimitInstance = serviceLogdb.create(pid);
      searchLimitQuery = searchLimitInstance.query(runLimitQuery, 1);
      try {
        searchLimitQuery
          .started(function(m) {
            //console.log("limit start",m)
          })
          .onHead(function(helper) {
            helper.getResult(function(message) {
              //console.log("limit head", message);
              $scope.$apply();
            });
          })
          .onStatusChange(function(message) {
            //console.log("limit change", message);
            $scope.$apply();
          })
          .onTail(function(helper) {
            helper.getResult(function(message) {
              // console.log("limit tail", message);
              if(message.body.count != 0 && message.body.result[0].searchLimit!=null) {
                $scope.userSearchLimit = message.body.result[0].searchLimit;
              }
              // console.log("Limit" , $scope.userSearchLimit)
              
              serviceLogdb.remove(searchLimitInstance);
              $scope.$apply()
            });
          })
          .loaded(function(m) {
            //console.log("limit load",m)
          })
          .failed(function(raw, type, note) {
            console.log("re fail",raw, type, note)
          });

        serviceLogdb.remove(searchLimitInstance);
      } catch (e) {
        console.log(e);
      }

      $scope.$apply();      
    });
  }

  $scope.wormDate = "0000-00-00";
  function getSearchWorm() {
    if(searchWormInstance!=null) {
      console.log("already search worm exist query ")
      serviceLogdb.remove(searchWormInstance);
    }

    var runWormQuery = "table WORM_LOG_DT | sort limit=1 name";
    // console.log("Query", runWormQuery)

    searchWormInstance = serviceLogdb.create(pid);
    searchWormQuery = searchWormInstance.query(runWormQuery, 1);
    try {
      searchWormQuery
      .started(function(m) {
        //console.log("limit start",m)
      })
      .onHead(function(helper) {
        helper.getResult(function(message) {
          //console.log("limit head", message);
          $scope.$apply();
        });
      })
      .onStatusChange(function(message) {
        //console.log("limit change", message);
        $scope.$apply();
      })
      .onTail(function(helper) {
        helper.getResult(function(message) {
          // console.log("worm tail", message);
          if(message.body.count != 0 && message.body.result[0].name!=null) {
            $scope.wormDate = message.body.result[0].name.substr(0,10);
          }
          // console.log("worm" , $scope.wormDate)
          
          serviceLogdb.remove(searchWormInstance);
          $scope.$apply()
        });
      })
      .loaded(function(m) {
        //console.log("limit load",m)
      })
      .failed(function(raw, type, note) {
        console.log("re fail",raw, type, note)
      });

      serviceLogdb.remove(searchWormInstance);
    } catch (e) {
      console.log(e);
    }
  }

  getSearchLimit();
  getSearchWorm();


  $scope.parentsTest = function() {
    console.log("PPParent Test");
  }


































    }

  })();
  //# sourceURL=apps/datalog-dsui/datalog-dsui/datalog/logSearch.js
  