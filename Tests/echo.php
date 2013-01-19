<?php

if ($_REQUEST['json'])
{
    echo $_REQUEST['json'];
}
else
{
    echo file_get_contents('php://input');
}

?>
