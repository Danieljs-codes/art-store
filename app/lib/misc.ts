export const toastKey = "en_toast";

export const convertToObject = <T extends object>(data: string | object): T => {
	if (typeof data === "object") {
		return data as T;
	}

	return JSON.parse(data) as T;
};

