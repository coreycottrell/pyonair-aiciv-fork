"""Guard (ticket 4090, INIT-058): the Pyonair/Korus fork template must not pin a model version.
A newborn gets the newest approved model from the platform default / ~/.claude_session_model, never from a typed version in this template."""
import json, pathlib, re, unittest
ROOT = pathlib.Path(__file__).resolve().parent.parent
MODEL = re.compile(r"claude-(opus|sonnet|haiku)-\d")

class NoModelPins(unittest.TestCase):
    def test_settings_env_has_no_model_pin(self):
        env = json.loads((ROOT / ".claude/settings.json").read_text()).get("env", {})
        for k in ("ANTHROPIC_MODEL", "CLAUDE_CODE_SUBAGENT_MODEL"):
            self.assertNotIn(k, env)

    def test_launchers_name_no_model(self):
        for f in ("tools/launch_civ_tower.sh", "tools/launch_primary_visible.sh"):
            for line in (ROOT / f).read_text().splitlines():
                if "claude " in line and not line.lstrip().startswith("#") and "send-keys" in line:
                    self.assertNotIn("--model", line, f)
                    self.assertIsNone(MODEL.search(line), f)

if __name__ == "__main__":
    unittest.main()
