/**
 * File with confusing similar names for testing AI edit accuracy
 */

// Similar function names
export function getData() {
	return "data"
}

export function getDataList() {
	return ["data1", "data2"]
}

export function getDataItem() {
	return { id: 1, data: "item" }
}

export function getDataItems() {
	return [{ id: 1 }, { id: 2 }]
}

// Similar variable patterns
export function processUser(userId: string) {
	const user = { id: userId }
	const userInfo = { id: userId, name: "user" }
	const userList = [user]
	const userData = { user, userInfo }
	return userData
}

// Similar class methods
export class DataService {
	private data: string[] = []
	private dataList: string[][] = []
	private dataMap: Map<string, string> = new Map()

	getData() {
		return this.data
	}

	getDataList() {
		return this.dataList
	}

	setData(value: string[]) {
		this.data = value
	}

	setDataList(value: string[][]) {
		this.dataList = value
	}

	addData(item: string) {
		this.data.push(item)
	}

	addDataList(items: string[]) {
		this.dataList.push(items)
	}
}

// Korean similar names
export function 데이터가져오기() {
	return "데이터"
}

export function 데이터목록가져오기() {
	return ["데이터1", "데이터2"]
}

export function 데이터항목가져오기() {
	return { id: 1 }
}
