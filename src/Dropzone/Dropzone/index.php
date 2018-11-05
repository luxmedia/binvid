<html>
 
<head>   
       <meta http-equiv="X-UA-Compatible" content="IE=edge" /> <!-- diables Compatibility Mode on Intranet Sites in DW -->
<!-- 1 -->
<link href="css/dropzone.css" type="text/css" rel="stylesheet" />
 <!--link rel="stylesheet" href="https://www.w3schools.com/w3css/4/w3.css"--> 
  
<!-- 2 -->
<script src="js/dropzone.js"></script>
<script src="js/chunks.js"></script>
 
</head>
 
<body>
 
<!-- 3 -->
<!--form action="chunks.php" class="dropzone"></form-->


 <form class="dropzone" id="my-awesome-dropzone">
 <div class="dropzone-previews"></div> <!-- this is were the previews should be shown. -->
 Titel:
  <!-- Now setup your input fields -->
  <input type="text" name="newFileName" />
  <br><br>
  Ziel:
    <select name="newDestination">
		<option value="avid">AVID</option>
		<option value="vpms">VPMS</option>
		<option value="medialoopster">Medialoopster</option>
	</select>
  <br><br>
  <button type="submit">Submit data and files!</button>
  

	
 </form>  
  


</body>
 
</html>