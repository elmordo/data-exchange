import {Int} from "../../lib";


describe("Field configuration", () => {
    describe("of names", () => {
        it("name is use as default for remote and local name", () => {
            const field = new Int("foo");
            expect(field.name).toBe("foo");
            expect(field.remoteName).toBe("foo");
            expect(field.localName).toBe("foo");
        });
        it("localName option override localName attribute", () => {
            const field = new Int("foo", {localName: "bar"});
            expect(field.name).toBe("foo");
            expect(field.remoteName).toBe("foo");
            expect(field.localName).toBe("bar");
        });
        it("loadName option override remoteName attribute", () => {
            const field = new Int("foo", {loadName: "bar"});
            expect(field.name).toBe("foo");
            expect(field.remoteName).toBe("bar");
            expect(field.localName).toBe("foo");
        });
        it("remoteName option override remoteName attribute", () => {
            const field = new Int("foo", {remoteName: "bar"});
            expect(field.name).toBe("foo");
            expect(field.remoteName).toBe("bar");
            expect(field.localName).toBe("foo");
        });
        it("dumpName option override localName attribute", () => {
            const field = new Int("foo", {dumpName: "bar"});
            expect(field.name).toBe("foo");
            expect(field.remoteName).toBe("foo");
            expect(field.localName).toBe("bar");
        });
    });
});
