module.exports = new Promise(function(resolve){
    setTimeout(function(){
        resolve({
            foo: 'foo',
            bar: 'bar',
        });
    }, 100);
});
