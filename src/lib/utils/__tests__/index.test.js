import { generarPistaLletres, getPista, localPais } from "../index";

describe("localPais", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  const mockOpcionsPais = {
    ca: { id: "ca" },
    pv: { id: "pv" },
    pb: { id: "pb" },
  };

  it("should return cached country if valid", () => {
    localStorage.setItem("pais", "ca");
    expect(localPais(mockOpcionsPais)).toBe("ca");
  });

  it("should return default country (ca) if cache is invalid", () => {
    localStorage.setItem("pais", "invalid");
    expect(localPais(mockOpcionsPais)).toBe("ca");
  });

  it("should return default country (ca) if cache is empty", () => {
    expect(localPais(mockOpcionsPais)).toBe("ca");
  });

  it("should set default country in localStorage if no cache exists", () => {
    localPais(mockOpcionsPais);
    expect(localStorage.getItem("pais")).toBe("ca");
  });

  it("should handle empty options object", () => {
    expect(localPais({})).toBe("ca");
  });

  it("should handle options without ca property", () => {
    const optionsWithoutCa = {
      pv: { id: "pv" },
      pb: { id: "pb" },
    };
    expect(localPais(optionsWithoutCa)).toBe("pv");
  });
});

describe("generarPistaLletres", () => {
  it("should return a string with same length as input", () => {
    const result = generarPistaLletres("test");
    expect(result.length).toBe(4);
  });

  it("should reveal exactly two letters", () => {
    const result = generarPistaLletres("testing");
    const revealedCount = (result.match(/[a-zA-Z]/g) || []).length;
    expect(revealedCount).toBe(2);
  });

  it("should use underscores for hidden letters", () => {
    const result = generarPistaLletres("abc");
    expect(result).toMatch(/[a-z]_[a-z]|_[a-z][a-z]|[a-z][a-z]_/);
  });

  it("should handle single character input", () => {
    const result = generarPistaLletres("a");
    expect(result).toBe("a");
  });

  it("should handle two character input", () => {
    const result = generarPistaLletres("ab");
    expect(result).toMatch(/[ab][ab]/);
  });

  it("should maintain original characters in revealed positions", () => {
    const input = "test";
    const result = generarPistaLletres(input);
    const revealed = result.split("").map((char, i) => {
      return char !== "_" ? input[i] === char : true;
    });
    expect(revealed.every((v) => v)).toBe(true);
  });
});


describe("getPista", () => {
  const mockMunicipioDiario = {
    provincia: "Barcelona",
    comarca: "Barcelonès",
    nom: "Barcelona",
  };

  it("should return provincia for index 0", () => {
    const result = getPista(0, mockMunicipioDiario);
    expect(result.props.children).toEqual(["Provincia: ", "Barcelona"]);
  });

  it("should return provincia and comarca for index 1", () => {
    const result = getPista(1, mockMunicipioDiario, null);
    expect(result.props.children).toHaveLength(2);
    expect(result.props.children[0].props.children).toEqual([
      "Provincia: ",
      "Barcelona",
    ]);
    expect(result.props.children[1].props.children).toEqual([
      "Comarca: ",
      "Barcelonès",
    ]);
  });

  it("should return all hints including pistaLletres for index 2", () => {
    const result = getPista(2, mockMunicipioDiario, "B_rc_l_na");
    expect(result.props.children).toHaveLength(3);
    expect(result.props.children[0].props.children).toEqual([
      "Provincia: ",
      "Barcelona",
    ]);
    expect(result.props.children[1].props.children).toEqual([
      "Comarca: ",
      "Barcelonès",
    ]);
    expect(result.props.children[2].props.children).toEqual([
      "Nom: ",
      "B_rc_l_na",
    ]);
  });

  it("should handle undefined municipioDiario", () => {
    const result = getPista(0, undefined, null);
    expect(result).toBe("");
  });

  it("should return empty string for invalid index", () => {
    const result = getPista(3, mockMunicipioDiario, null);
    expect(result).toBe("");
  });

  it("should return empty string for negative index", () => {
    const result = getPista(-1, mockMunicipioDiario, null);
    expect(result).toBe("");
  });

  it("should handle null municipioDiario", () => {
    const result = getPista(1, null, null);
    expect(result).toBe("");
  });
});
