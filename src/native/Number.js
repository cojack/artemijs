/**
 * Returns the number of zero bits following the lowest-order ("rightmost")
 * one-bit in the two's complement binary representation of the specified
 * {@code long} value.  Returns 64 if the specified value has no
 * one-bits in its two's complement representation, in other words if it is
 * equal to zero.
 *
 * @param {Number} i
 * @return {Number} the number of zero bits following the lowest-order ("rightmost")
 *     one-bit in the two's complement binary representation of the
 *     specified {@code long} value, or 64 if the value is equal
 *     to zero.
 * @since 1.5
 * @see http://grepcode.com/file_/repository.grepcode.com/java/root/jdk/openjdk/6-b14/java/lang/Long.java/?v=source
 */
Number.prototype.numberOfTrailingZeros = function(i) {
    var x, y;
    if (i === 0) return 64;
    var n = 63;
    y = parseInt(i); if (y !== 0) { n = n -32; x = y; } else x = parseInt(i>>>32);
    y = x <<16; if (y !== 0) { n = n -16; x = y; }
    y = x << 8; if (y !== 0) { n = n - 8; x = y; }
    y = x << 4; if (y !== 0) { n = n - 4; x = y; }
    y = x << 2; if (y !== 0) { n = n - 2; x = y; }
    return n - ((x << 1) >>> 31);
};

/**
 * Returns the number of zero bits preceding the highest-order
 * ("leftmost") one-bit in the two's complement binary representation
 * of the specified {@code long} value.  Returns 64 if the
 * specified value has no one-bits in its two's complement representation,
 * in other words if it is equal to zero.
 *
 * <p>Note that this method is closely related to the logarithm base 2.
 * For all positive {@code long} values x:
 * <ul>
 * <li>floor(log<sub>2</sub>(x)) = {@code 63 - numberOfLeadingZeros(x)}
 * <li>ceil(log<sub>2</sub>(x)) = {@code 64 - numberOfLeadingZeros(x - 1)}
 * </ul>
 *
 * @param {Number} i
 * @return {Number} the number of zero bits preceding the highest-order
 *     ("leftmost") one-bit in the two's complement binary representation
 *     of the specified {@code long} value, or 64 if the value
 *     is equal to zero.
 * @since 1.5
 * @see http://grepcode.com/file_/repository.grepcode.com/java/root/jdk/openjdk/6-b14/java/lang/Long.java/?v=source
 */
Number.prototype.numberOfLeadingZeros = function(i) {
    if (i === 0)
        return 64;
    var n = 1;
    var x = parseInt(i >>> 32);
    if (x === 0) { n += 32; x = parseInt(i); }
    if (x >>> 16 == 0) { n += 16; x <<= 16; }
    if (x >>> 24 == 0) { n +=  8; x <<=  8; }
    if (x >>> 28 == 0) { n +=  4; x <<=  4; }
    if (x >>> 30 == 0) { n +=  2; x <<=  2; }
    n -= x >>> 31;
    return n;
};