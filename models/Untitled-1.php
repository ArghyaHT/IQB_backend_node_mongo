
text/x-generic iqueueinsertinjoinq_v2.php ( PHP script, ASCII text, with very long lines, with CRLF line terminators )
<?php
require_once ("db_config.php");

date_default_timezone_set('Europe/London');

 //turn off error reporting
 //error_reporting(E_ALL ^  E_NOTICE ^ E_WARNING);
 
 //Create fields for the database

 
//$dbhost = "server.iqueuebarbers.com";
//$dbuser = "iqueue_dev";
//$dbpass = "iqueuedev";
//$dbdb = "iqueue_iqb_database";
  
// array for JSON response
$response = array();

//connect to mySQL
//$connect = mysql_connect ($dbhost, $dbuser, $dbpass) or die ("connection error");

//Select the database
//mysql_select_db($dbdb)or die("database selection error");

//Join queue details via POST
$position = $_POST['position'];
$username = $_POST['username'];
$firstlastname = $_POST['firstlastname'];
$joinedq = "Y";
// $datejoinedq = $_POST['rdatejoinedq'];
$datejoinedq = date('d-m-Y');
// $timejoinedq = $_POST['timejoinedq'];
$timejoinedq = date('H:i:s');
$loggedin = "Y";
$methodused = 'Mobile App.';
$barbername= $_POST['barbername'];
$forceupdate= "Y";
$salonid = $_POST['salonid'];
$qgcode = $_POST['qgcode'];
// Check Change Start
$singleJoin = $_POST['is_single_join'];
//--------------------------------------------------------------
$ServiceId = $_POST['ServiceId'];
$BarberId = $_POST['BarberId'];

if($ServiceId=='-1')
{
    $ServiceId='0';
}



//---------------------------------------
$proceed = 1;
if ($singleJoin == 'yes') {
	$sqlSetCheck = $GLOBALS["db"]->sqlQuery("SELECT `SystemStatus` FROM `AdminSettings` WHERE `User` = '".$salonid."' ");
	//$sqlSetCheck = mysql_query("SELECT `SystemStatus` FROM `AdminSettings` WHERE `User` = ". $salonid);
	
	//if (mysql_num_rows($sqlSetCheck) > 0) {
	if (($GLOBALS["db"]->sqlNumRows($sqlSetCheck)) > 0) {
		
		$resSetCheck = $GLOBALS["db"]->sqlFetchRowAssoc($sqlSetCheck);
		//$resSetCheck = mysql_fetch_assoc($sqlSetCheck);
		if ($resSetCheck['SystemStatus'] == 'Online') {
		    
		    $sqlBarbarCheck = $GLOBALS["db"]->sqlQuery("SELECT `BarberOnline` FROM `BarbersWorking` 
					WHERE `SalonId` = '".$salonid."' AND `BarberName` LIKE '".$barbername."' ");
			//$sqlBarbarCheck = mysql_query("SELECT `BarberOnline` FROM `BarbersWorking` 
				//	WHERE `SalonId` = $salonid AND `BarberName` LIKE '$barbername'");
			//if (mysql_num_rows($sqlBarbarCheck) > 0) {
			if (($GLOBALS["db"]->sqlNumRows($sqlBarbarCheck)) > 0) {
				$resBarbarCheck = $GLOBALS["db"]->sqlFetchRowAssoc($sqlBarbarCheck);
				//$resBarbarCheck = mysql_fetch_assoc($sqlBarbarCheck);
				if ($resBarbarCheck['BarberOnline'] == 'Y') {
					$proceed = 1;
				}
				else {
					$proceed = 0;
					$response["StatusCode"] = 201;
					$response["Response"] = 0;
					$response["StatusMessage"] = "Barber is offline.";
					
					// echoing JSON response
					echo json_encode($response);
				}
			}
			else {
				$proceed = 0;
				$response["StatusCode"] = 201;
				$response["Response"] = 0;
				$response["StatusMessage"] = "Could not fetch Barber.";
				
				// echoing JSON response
				echo json_encode($response);
			}
		}
		else {
			$proceed = 0;
			$response["StatusCode"] = 201;
			$response["Response"] = 0;
			$response["StatusMessage"] = "System is offline.";
			
			// echoing JSON response
			echo json_encode($response);
		}
	}
	else {
		$proceed = 0;
		$response["StatusCode"] = 201;
		$response["Response"] = 0;
		$response["StatusMessage"] = "Could not fetch System Status.";
		
		// echoing JSON response
		echo json_encode($response);
	}
	
	
}

if ($proceed == 1 && $barbername == 'Any Barber' && $ServiceId != 0){
    //$sqlSetCheck1 = mysql_query("SELECT `BarberOnline` FROM `BarbersWorking` WHERE `SalonId` = $salonid AND `BarberOnline` = 'Y'");
    
    $sqlSetCheck1 = $GLOBALS["db"]->sqlQuery("SELECT BarbersWorking.BarberOnline FROM BarbersWorking, BarbersService where BarbersService.BarberId=BarbersWorking.BarberId and BarbersService.ServiceId='".$ServiceId."' and BarbersWorking.SalonId = '".$salonid."' AND BarbersWorking.BarberOnline = 'Y' ");
    
    //$sqlSetCheck1 = mysql_query("SELECT BarbersWorking.BarberOnline FROM BarbersWorking, BarbersService where BarbersService.BarberId=BarbersWorking.BarberId and BarbersService.ServiceId=$ServiceId and BarbersWorking.SalonId = $salonid AND BarbersWorking.BarberOnline = 'Y'");
   
					
	//if (mysql_num_rows($sqlSetCheck1) <= 0) {
	if (($GLOBALS["db"]->sqlNumRows($sqlSetCheck1)) <= 0) {
	    $proceed = 0;
		$response["StatusCode"] = 201;
		$response["Response"] = 0;
		$response["StatusMessage"] = "No barbers currently on duty.";
		echo json_encode($response);
	}
}


// Check Change End
if ($proceed == 1) {
    
    $newEntry = true;
    $logNo = '';
    if($qgcode != '' && $qgcode != null && $qgcode != 'N/A') {					// Fetch LogNo for Group Join
    	
    	$getLogQuery = $GLOBALS["db"]->sqlQuery("SELECT `LogNo` FROM `joinqueuestatuslog` WHERE `QGCode` = '".$qgcode."' AND `SalonId` = '".$salonid."' ");
    	//$getLogQuery = mysql_query("SELECT `LogNo` FROM `joinqueuestatuslog` WHERE `QGCode` = '".$qgcode."' AND `SalonId` = '".$salonid."'");
    	//if (mysql_num_rows($getLogQuery) > 0) {
    	if (($GLOBALS["db"]->sqlNumRows($getLogQuery)) > 0) {
    	    
    		$resLogQuery = $GLOBALS["db"]->sqlFetchRowAssoc($getLogQuery);
    		//$resLogQuery = mysql_fetch_assoc($getLogQuery);
    		$logNo = $resLogQuery['LogNo'];
    		$newEntry = false;
    	}
    	else{
    	    $logNoLength = 8;
        	$characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
        	$charactersLength = strlen($characters);
        	$logNo = '';
        	for ($i = 0; $i < $logNoLength; $i++) {
        		$logNo .= $characters[rand(0, $charactersLength - 1)];
        	}
        	$newEntry = true;
    	}
    }
    else {
    	// Generate Random String to create unique Log Number
    	$logNoLength = 8;
    	$characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    	$charactersLength = strlen($characters);
    	$logNo = '';
    	for ($i = 0; $i < $logNoLength; $i++) {
    		$logNo .= $characters[rand(0, $charactersLength - 1)];
    	}
    	$newEntry = true;
    }
	
	$currentDateTime = date('Y-m-d H:i:s');
	
	// set DefaultEWT time depend on serviceId
	$BarberEWT=0;
	if($ServiceId == 0)
	{
	    $sqlEWT="select * from BarbersTable where Id='".$BarberId."'" ;
	    $queryEWT = $GLOBALS["db"]->sqlQuery($sqlEWT);
	    //$queryEWT = mysql_query($sqlEWT) ;
	     $listEWT=$GLOBALS["db"]->sqlFetchRowAssoc($queryEWT);
	    //$listEWT=mysql_fetch_assoc($queryEWT);
	    $BarberEWT = $listEWT['DefaultEWT'] ;
	    
	}
	//Query the table t insert in JoinQueueTable
   //$firstlastname="hi";
    $fieldArr = array(
                'SalonId'=>$salonid,
                'Position'=>$position,
                'Username'=>$username,
                'FirstLastName'=>$firstlastname,
                'JoinedQ'=>$joinedq,
                'DateJoinedQ'=>$datejoinedq,
                'TimeJoinedQ'=>$timejoinedq,
                'TimePositionChanged'=>$timejoinedq,
                'LoggedIn'=>$loggedin,
                'MethodUsed'=>$methodused,
                'BarberName'=>$barbername,
                'ForceUpdate'=>$forceupdate,
                'QGCode'=>$qgcode,
                'PositionChangedMessageShown'=>'Y',
                'LogNo'=>$logNo,
                'ServiceId'=>$ServiceId,
                'BarberId'=>$BarberId,
                'BarberDefaultEWT'=>$BarberEWT,
                );
    //echo '<pre>';print_r($fieldArr);echo '</pre><br>';
    $query = $GLOBALS['db']->sqlInsert("JoinQueueTable", $fieldArr);
	
	//echo "INSERT INTO JoinQueueTable(SalonId, Position, Username, FirstLastName, JoinedQ, DateJoinedQ, 
		//	TimeJoinedQ, TimePositionChanged, LoggedIn, MethodUsed, BarberName, ForceUpdate, QGCode, PositionChangedMessageShown, LogNo,ServiceId, BarberId,BarberDefaultEWT) 
		//	VALUES('$salonid','$position','$username','$firstlastname', '$joinedq', '$datejoinedq', 
		//	'$timejoinedq', '$timejoinedq', '$loggedin', '$methodused', '$barbername', '$forceupdate', '$qgcode', 'Y', '$logNo','$ServiceId','$BarberId','$BarberEWT')";
	//die;
   
	//$query = mysql_query("INSERT INTO JoinQueueTable(SalonId, Position, Username, FirstLastName, JoinedQ, DateJoinedQ, 
			//TimeJoinedQ, TimePositionChanged, LoggedIn, MethodUsed, BarberName, ForceUpdate, QGCode, PositionChangedMessageShown, LogNo,ServiceId, BarberId,BarberDefaultEWT) 
		//	VALUES('$salonid','$position','$username','$firstlastname', '$joinedq', '$datejoinedq', 
		//	'$timejoinedq', '$timejoinedq', '$loggedin', '$methodused', '$barbername', '$forceupdate', '$qgcode', 'Y', '$logNo','$ServiceId','$BarberId','$BarberEWT')");
			
			
			//$query = mysql_query("INSERT INTO JoinQueueTable(SalonId, Position, Username, FirstLastName, JoinedQ, DateJoinedQ, 
			//TimeJoinedQ, TimePositionChanged, LoggedIn, MethodUsed, BarberName, ForceUpdate, QGCode, PositionChangedMessageShown, LogNo,ServiceId) 
			//VALUES('2', '20', '19196', 'Garima Kumari', '', '', 
			//'', '', '', '', 'GJ', 'Y', 'N/A', 'Y', '','54')");
	
	if ($newEntry) {
		// Log Table Query
		$fieldArr = array(
                'SalonId'=>$salonid,
                'Username'=>$username,
                'QGCode'=>$qgcode,
                'QueueJoinStat'=>1,
                'LogNo'=>$logNo,
                'date_created'=>$currentDateTime,
                'date_modified'=>$currentDateTime,
                
                );
    $logTableQuery = $query = $GLOBALS['db']->sqlInsert("joinqueuestatuslog", $fieldArr);
		
	//	$logTableQuery = mysql_query("INSERT INTO `joinqueuestatuslog`(`SalonId`,`Username`, `QGCode`, `QueueJoinStat`, `LogNo`, `date_created`, `date_modified`) 
					//	VALUES ('$salonid','$username','$qgcode',1,'$logNo','$currentDateTime','$currentDateTime')");
	}
	
	 // check if row inserted or not
	    if ($query) {
	        // successfully inserted into database
	    	$response["StatusCode"] = 200;
	        $response["Response"] = 1;
	        $response["StatusMessage"] = "Successfully joined to the queue.";
	 
	        // echoing JSON response
	        echo json_encode($response);
	    } else {
	        // failed to insert row
	    	$response["StatusCode"] = 201;
	        $response["Response"] = 0;
	        $response["StatusMessage"] = "Oops! An error occurred.";
	 
	        // echoing JSON response
	        echo json_encode($response);
	}
}
?>