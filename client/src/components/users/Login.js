<!DOCTYPE html>
<html>
<head>
    <%- include('../common/head'); %>
</head>
<body>
<%- include('../common/header'); %>
<main>
    <div id="form_container"></div>
</main>
<%- include('../common/footer'); %>
<script>
    // build user form
    nodeBuilder.build("form_container", <%- form %>);
    // initialize form validator
    window.onload = formValidator.init(<%- validator %>);
</script>
</body>
</html>