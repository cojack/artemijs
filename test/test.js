Object.defineProperty(Object.prototype, "class", {
    get: function () {
        return this.prototype.constructor.name;
    }
});

function Test() {

}

console.log(Test.class);
