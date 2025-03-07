import {
	ActorDamageCause,
	Color,
	EffectType,
	Gamemode
} from "@serenityjs/protocol";

import { Effect } from "./effect";

import type { Entity } from "../entity";

class PoisonEffect<T extends Entity> extends Effect {
	public effectType: EffectType = EffectType.Poison;
	public instant: boolean = false;
	public color: Color = new Color(255, 78, 147, 49);

	public onTick?(entity: T): void {
		let ticksPerSecond = Math.floor(
			Math.max(25 * Math.pow(0.5, this.amplifier - 1), 12)
		);
		ticksPerSecond = Math.min(ticksPerSecond, 10);

		if (Number(entity.dimension.world.currentTick) % ticksPerSecond != 0)
			return;
		if (entity.isPlayer() && entity.gamemode == Gamemode.Creative) return;
		const entityHealth = entity.getComponent("minecraft:health");

		if (entityHealth.getCurrentValue() <= 1) return;
		entity.applyDamage(1, ActorDamageCause.Magic);
	}

	public onAdd?(entity: T): void;

	public onRemove?(entity: T): void;
}

export { PoisonEffect };
