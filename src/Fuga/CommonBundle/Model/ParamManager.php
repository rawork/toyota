<?php

namespace Fuga\CommonBundle\Model;

class ParamManager extends ModelManager
{
	protected $entityTable = 'config_param';
	protected $params = array();

	public function findAll($name) {
		if (!isset($this->params[$name])){
			$sql = "SELECT * FROM config_param WHERE module= :name ";
			$stmt = $this->get('connection')->prepare($sql);
			$stmt->bindValue("name", $name);
			$stmt->execute();

			$params = $stmt->fetchAll();
			$this->params[$name] = array();
			foreach ($params as $param) {
				$this->params[$name][$param['name']] = $param;
			}
		}

		return $this->params[$name];
	}

	public function getValue($module, $name) {
		if(!isset($this->params[$module]) || !isset($this->params[$module])) {
			$sql = "SELECT * FROM config_param WHERE module= :module AND name= :name";
			$stmt = $this->get('connection')->prepare($sql);
			$stmt->bindValue("module", $module);
			$stmt->bindValue("name", $name);
			$stmt->execute();
			$param = $stmt->fetch();
			if (!isset($this->params[$module])) {
				$this->params[$module] = array();
			}
			if ($param) {
				$this->params[$module][$param['name']] = $param;
			}

		}

		if (isset($this->params[$module][$name])) {
			switch ($this->params[$module][$name]['type']) {
				case 'boolean':
					return boolval($this->params[$module][$name]['value']);
				case 'integer':
					return intval($this->params[$module][$name]['value']);
				default:
					return $this->params[$module][$name]['value'];
			}
		}

		return null;
	}

	public function validate($value, $param = array())
	{
		$ret = null;

		switch ($param['type']) {
			case 'boolean':
				if (intval($value) >= intval($param['minvalue']) && intval($value) <= intval($param['maxvalue'])) {
					$ret = intval($value);
				} else {
					$ret = intval($param['defaultvalue']);
				}
				break;
			case 'integer':
				if (intval($value) >= intval($param['minvalue']) && intval($value) <= intval($param['maxvalue'])) {
					$ret = intval($value);
				} else {
					$ret = intval($param['defaultvalue']);
				}
				break;
			default:
				$ret = $value;
		}

		return $ret;
	}
}