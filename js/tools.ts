"use strict";

interface IPokepastTeam {
    author: string;
    note?: string;
    title: string;
    paste: string;
}

interface ITeamInfo {
    author: string;
    title: string;
    pokemons: string[];
    link: string;
}

type codeStyle = "ou" | "uu" | "uber";

export class Tools {
    static cookieName = "pokepastlinks";
    static cookieExpireTime = 7 * 24 * 60 * 60 * 1000; // 7 days
    static inputTextAreaId = "linksInput";
    static generateButtonId = "generateHTML";
    static generatedCodeStyleId = "htmlStyle";
    static outputTextAreaId = "htmlCode";
    static linkRegex = /(https:\/\/)?pokepast\.es\/[a-zA-Z0-9]{16}/gm;

    static storeLinksToCookies(links: string) {
        const cookieExpireDate = new Date(Date.now() + Tools.cookieExpireTime);
        const cookieValue = `${Tools.cookieName}=${encodeURIComponent(links)}; expires=${cookieExpireDate.toUTCString()}; path=/`;
        document.cookie = cookieValue;
    }

    static getLinksFromCookies(): string {
        if (document.cookie === "") {
            return "";
        }
        const cookies = document.cookie.split("; ");
        for (const cookie of cookies) {
            if (cookie.startsWith(Tools.cookieName)) {
                return decodeURIComponent(cookie.split("=")[1]!);
            }
        }
        return "";
    }

    static clearCookies() {
        document.cookie = `${Tools.cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`;
    }

    static setLinksToInputFromCookies() {
        const links = Tools.getLinksFromCookies();
        if (links !== "") {
            const inputTextArea = document.getElementById(Tools.inputTextAreaId) as HTMLTextAreaElement | null;
            if (!inputTextArea) throw new Error("Input text area not found");
            inputTextArea.value = links;
        }
    }

    static setOnTextInput() {
        const inputTextArea = document.getElementById(Tools.inputTextAreaId) as HTMLTextAreaElement | null;
        if (!inputTextArea) throw new Error("Input text area not found");
        inputTextArea.addEventListener("input", () => Tools.onTextInput());
    }

    static onTextInput() {
        const inputTextArea = document.getElementById(Tools.inputTextAreaId) as HTMLTextAreaElement | null;
        if (!inputTextArea) throw new Error("Input text area not found");
        Tools.storeLinksToCookies(inputTextArea.value);
    }

    static copyHTMLToClipboard() {
        const outputTextArea = document.getElementById(Tools.outputTextAreaId) as HTMLTextAreaElement | null;
        if (!outputTextArea) throw new Error("Output text area not found");
        outputTextArea.focus();
        void navigator.clipboard.writeText(outputTextArea.value);
    }

    static fetchTeam(link: string): Promise<ITeamInfo> | null {
        // if (!Tools.isPokepastLink(link)) return null;
        return fetch(link + "/json", {
            headers: {
                accept: "*/*",
                "sec-ch-ua": '"Google Chrome";v="125", "Chromium";v="125", "Not.A/Brand";v="24"',
                "sec-ch-ua-mobile": "?0",
                "sec-ch-ua-platform": '"Windows"',
            },
            referrer: "127.0.0.1",
            referrerPolicy: "strict-origin-when-cross-origin",
            body: null,
            method: "GET",
            mode: "cors",
            credentials: "omit",
        })
            .then((response) => response.json())
            .then((team: IPokepastTeam) => {
                const pokemons = team.paste
                    .split("\n")
                    .filter((l) => l.includes("@"))
                    .map((l: string) => l.split("@")[0]!.split("(")[0]!.trim());
                return { pokemons, author: team.author, title: team.title, link };
            });
    }

    static isPokepastLink(link: string): boolean {
        return Tools.linkRegex.test(link);
    }

    static onGenerateButtonClick() {
        const inputTextArea = document.getElementById(Tools.inputTextAreaId) as HTMLTextAreaElement | null;
        const outputTextArea = document.getElementById(Tools.outputTextAreaId) as HTMLTextAreaElement | null;
        if (!inputTextArea || !outputTextArea) throw new Error("Input text area not found");
        const links = (inputTextArea.value?.split("\n") ?? []).map((l) => l.trim());
        const style = document.getElementById(Tools.generatedCodeStyleId) as HTMLSelectElement | null;
        if (!style) throw new Error("Please select a style");
        Promise.all(links.map((l) => Tools.fetchTeam(l)))
            .then((teams) => {
                const code = Tools.generateHTMLCode(teams.filter((t) => t !== null) as ITeamInfo[], style.value as codeStyle);
                outputTextArea.value = code;
                Tools.copyHTMLToClipboard();
            })
            .catch((e): void => console.error(e));
    }

    static setOnGenerateButtonClick() {
        const generateButton = document.getElementById(Tools.generateButtonId) as HTMLButtonElement | null;
        if (!generateButton) throw new Error("Generate button not found");
        generateButton.addEventListener("click", () => {
            Tools.onGenerateButtonClick();
        });
    }

    static generateHTMLCode(teams: ITeamInfo[], style: codeStyle): string {
        switch (style) {
            case "ou": {
                return Tools.generateOUStyle(teams);
            }

            case "uu": {
                return Tools.generateUUStyle(teams);
            }

            case "uber": {
                return Tools.generateOldUberStyle(teams);
            }

            default: {
                throw style satisfies never;
            }
        }
    }

    static generateOUStyle(teams: ITeamInfo[]): string {
        let code = "";
        for (const team of teams) {
            const last = team.pokemons[team.pokemons.length - 1];
            for (const pokemon of team.pokemons) {
                code +=
                    '<a href="//dex.pokemonshowdown.com/pokemon/' +
                    pokemon +
                    '" target="_blank" rel="noopener"><psicon pokemon="' +
                    pokemon +
                    '"></a>';
                if (pokemon !== last) code += "|";
                else
                    code +=
                        '- <b><a href="' +
                        team.link +
                        '" target="_blank" rel="noopener">' +
                        team.title +
                        " by " +
                        team.author +
                        "</a></b><br>";
            }
        }
        return code;
    }

    static generateUUStyle(teams: ITeamInfo[]): string {
        let code = "";
        const limit = teams.length - 1;
        const i = 0;
        for (const team of teams) {
            code +=
                team.title +
                " by " +
                team.author +
                "<br>" +
                '<a href="' +
                team.link +
                '" target="_blank" rel="noopener">' +
                team.link +
                "</a>";
            if (i !== limit) code += "<br><br>";
        }
        return code;
    }

    static generateOldUberStyle(teams: ITeamInfo[]): string {
        let code = '<ul style="list-style-type: none">';
        for (const team of teams) {
            code += '<li style="margin-bottom: 5px">';
            code +=
                "<i>" +
                team.title +
                " by <b>" +
                team.author +
                "</b></i><br>" +
                '<a href="' +
                team.link +
                '" style="text-decoration: none" target="_blank" rel="noopener">';
            for (const pokemon of team.pokemons) {
                code += '<psicon pokemon="' + pokemon + '">';
            }
            code += "</a></li>";
        }
        code += "</ul>";
        return code;
    }
}
