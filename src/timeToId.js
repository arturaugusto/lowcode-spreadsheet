const digit = "-0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz";
export default {
	toB64: (x) => {
		x = !x ? Date.now() : x
		let id = x.toString(2).split(/(?=(?:.{6})+(?!.))/g).map(v=>digit[parseInt(v,2)]).join("")
		if (id.length < 8) return '-'+id
		return id
	}
}