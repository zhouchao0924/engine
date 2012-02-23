pc.scene.materialplugin.phong = {};

pc.scene.materialplugin.phong.isTransparent = function (material) {
    var parameters = material.getParameters();
    if (parameters["material_opacity"] !== undefined) {
        if (parameters["material_opacity"]._data < 1.0)
            return true;
    }
    if (parameters["texture_opacityMap"] !== undefined) {
        return true;
    }
    if (parameters["texture_diffuseMap"] !== undefined) {
        if (parameters["texture_diffuseMap"]._data.getFormat() === pc.gfx.TextureFormat.RGBA)
            return true;
    }
    return false;
}

pc.scene.materialplugin.phong.generateStateKey = function (mesh) {
    var scene = pc.scene.Scene.current;
    var i;
    var numDirs = 0, numPnts = 0, numSpts = 0; // Non-shadow casters
    var numSDirs = 0, numSPnts = 0, numSSpts = 0; // Shadow casters
    if (scene) {
        for (i = 0; i < scene._globalLights.length; i++) {
            if (scene._globalLights[i].castShadows()) {
                numSDirs++;
            } else {
                numDirs++;
            }
        }
        for (i = 0; i < mesh._localLights[0].length; i++) {
            if (mesh._localLights[0][i].castShadows()) {
                numSPnts++;
            } else {
                numPnts++;
            }
        }
        for (i = 0; i < mesh._localLights[1].length; i++) {
            if (mesh._localLights[1][i].castShadows()) {
                numSSpts++;
            } else {
                numSpts++;
            }
        }
    }
    var skinned = mesh.getGeometry().isSkinned();
    var currState = pc.gfx.Device.getCurrent().getCurrentState();
    var key = '';
    if (skinned) key += 'skin_';
    if (currState.fog) key += 'fog_';
    if (currState.alphaTest) key += 'atst_';
    key += numDirs + 'dir_' + numPnts + 'pnt_' + numSpts + 'spt' + numSDirs + 'sdir_' + numSPnts + 'spnt_' + numSSpts + 'sspt';
    return key;
}

pc.scene.materialplugin.phong.getProgram = function (material, mesh) {
    var scene = pc.scene.Scene.current;
    var i;
    var numDirs = 0, numPnts = 0, numSpts = 0; // Non-shadow casters
    var numSDirs = 0, numSPnts = 0, numSSpts = 0; // Shadow casters
    if (scene) {
        for (i = 0; i < scene._globalLights.length; i++) {
            if (scene._globalLights[i].castShadows()) {
                numSDirs++;
            } else {
                numDirs++;
            }
        }
        for (i = 0; i < mesh._localLights[0].length; i++) {
            if (mesh._localLights[0][i].castShadows()) {
                numSPnts++;
            } else {
                numPnts++;
            }
        }
        for (i = 0; i < mesh._localLights[1].length; i++) {
            if (mesh._localLights[1][i].castShadows()) {
                numSSpts++;
            } else {
                numSpts++;
            }
        }
    }
    var skinned = mesh.getGeometry().isSkinned();
    var device = pc.gfx.Device.getCurrent();
    var currState = device.getCurrentState();
    var parameters = material.getParameters();
    var options = {
        alphaTest:         currState.alphaTest,
        fog:               currState.fog,
        skin:              skinned,
        numDirs:           numDirs,
        numSDirs:          numSDirs,
        numPnts:           numPnts,
        numSPnts:          numSPnts,
        numSpts:           numSpts,
        numSSpts:          numSSpts,
        diffuseMap:        (parameters["texture_diffuseMap"] !== undefined),
        specularMap:       (parameters["texture_specularMap"] !== undefined),
        specularFactorMap: (parameters["texture_specularFactorMap"] !== undefined),
        emissiveMap:       (parameters["texture_emissiveMap"] !== undefined),
        opacityMap:        (parameters["texture_opacityMap"] !== undefined),
        normalMap:         (parameters["texture_normalMap"] !== undefined),
        parallaxMap:       (parameters["texture_parallaxMap"] !== undefined),
        sphereMap:         (parameters["texture_sphereMap"] !== undefined),
        cubeMap:           (parameters["texture_cubeMap"] !== undefined),
        lightMap:          (parameters["texture_lightMap"] !== undefined)
    };
    var library = device.getProgramLibrary();
    return library.getProgram("phong", options);
}