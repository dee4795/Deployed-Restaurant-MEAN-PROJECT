export interface Country {
    code: string;
    dialCode: string;
    name: string;
}

export const COUNTRY_LIST: Country[] = [
    { code: "IN", dialCode: "+91", name: "India" },
    { code: "US", dialCode: "+1", name: "United States" },
    { code: "JP", dialCode: "+81", name: "Japan" },
    { code: "FR", dialCode: "+33", name: "France" },
    { code: "IT", dialCode: "+39", name: "Italy" },
    { code: "AU", dialCode: "+61", name: "Australia" },
    { code: "BR", dialCode: "+55", name: "Brazil" },
    { code: "CA", dialCode: "+1", name: "Canada" },
    { code: "CN", dialCode: "+86", name: "China" },
    { code: "DE", dialCode: "+49", name: "Germany" },
    { code: "RU", dialCode: "+7", name: "Russia" },
    { code: "SG", dialCode: "+65", name: "Singapore" },
    { code: "GB", dialCode: "+44", name: "United Kingdom" },
    { code: "AE", dialCode: "+971", name: "United Arab Emirates" },
    // Add more countries as needed
];