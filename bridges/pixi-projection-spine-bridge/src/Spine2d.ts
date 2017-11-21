import * as pixi_projection from '@local/pixi-projection';
import * as pixi_spine from '@local/pixi-spine'
import * as assignDeep from 'object-assign-deep';

console.log(pixi_spine);

namespace pixi_projection_spine_bridge
{
    export interface Sprite2d
    {
        region: pixi_spine.core.TextureRegion;
    }

    export interface Mesh2d
    {
        region: pixi_spine.core.TextureRegion;
    }

    export class Spine2d extends pixi_spine.Spine
    {
        constructor(spineData: pixi_spine.core.SkeletonData)
        {
            super(spineData);

            this.convertTo2d();
        }

        proj: pixi_projection.Projection2d;

        newContainer()
        {
            return new pixi_projection.Container2d();
        }

        newSprite(tex: PIXI.Texture): pixi_spine.SpineSprite
        {
            return <pixi_spine.SpineSprite> new pixi_projection.Sprite2d(tex);
        }

        newGraphics()
        {
            //TODO: make Graphics2d
            return new PIXI.Graphics();
        }

        newMesh(texture: PIXI.Texture, vertices?: Float32Array, uvs?: Float32Array, indices?: Uint16Array, drawMode?: number): pixi_spine.SpineMesh
        {
            return <pixi_spine.SpineMesh> new pixi_projection.Mesh2d(texture, vertices, uvs, indices, drawMode);
        }

        transformHack()
        {
            return 2;
        }
    }
}

assignDeep(pixi_projection, pixi_projection_spine_bridge);
