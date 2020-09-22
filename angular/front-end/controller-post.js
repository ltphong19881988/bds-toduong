var GetHotProduct = function(filter, $http, callback) {
    let params = {
        method: 'POST',
        url: '/product/filter-product',
        data: {
            filter: filter
        }
    }
    submitFrontEnd(params, $http, function(res) {
        callback(res);
    })
}


app.controller("postDetailCtrl", function($rootScope, $scope, $http, $compile, $routeParams) {
    $rootScope.pageTitle = "Bất động sản Tô Dương";
    // console.log('category', $routeParams);
    // console.log('location', location.pathname);
    var abc = location.pathname.split('-nr');
    // console.log('abc', abc);
    let params = {
        method: 'GET',
        url: '/post/name-key/' + 'nr' + abc[1],
    };
    submitFrontEnd(params, $http, function(res) {
        console.log('details', res);
        $rootScope.pageTitle += ' - ' + res.post.postContent.title;
        $scope.post = res.post;
        $scope.relatedPosts = res.relatedPosts;

        jQuery('p  img').ready(function(){
            jQuery('p  img').each(function(){
                jQuery(this).closest("p").css('text-align', 'center');
            });
        });
        
    })


});